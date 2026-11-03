"use strict";
const net = require("net");
const fs = require("fs");
const path = require("path");
const bson = require("bson");
const { BSON, ObjectId, Long } = bson;

const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "cpanel_db.json");
const PHP_MYSQL_SYNC_URL = "http://ekosmartfeedback.in.ekosmartdrive.in/mysql_sync.php";

let collections = {};
let saveTimer = null;

function serializeExtended(val) {
  if (val === null || val === undefined) return val;
  if (val instanceof ObjectId || (val && val._bsontype === "ObjectId")) {
    return { $oid: val.toString() };
  }
  if (val instanceof Date) {
    return { $date: val.toISOString() };
  }
  if (Array.isArray(val)) {
    return val.map(serializeExtended);
  }
  if (typeof val === "object") {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = serializeExtended(v);
    }
    return out;
  }
  return val;
}

function deserializeExtended(val) {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(deserializeExtended);
  if (typeof val === "object") {
    if (val.$oid && Object.keys(val).length === 1) {
      try { return new ObjectId(val.$oid); } catch { return val.$oid; }
    }
    if (val.$date && Object.keys(val).length === 1) {
      return new Date(val.$date);
    }
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = deserializeExtended(v);
    }
    return out;
  }
  return val;
}

function loadFromDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      collections = deserializeExtended(raw) || {};
    }
  } catch (e) {
    console.error("[cPanelDB] Load error:", e.message);
    collections = {};
  }
}

function scheduleSave(changedColl) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const serialized = serializeExtended(collections);
      fs.writeFileSync(DB_FILE, JSON.stringify(serialized), "utf8");
      // Also trigger background sync to cPanel MySQL database (ekosmart_Feedback)
      if (changedColl) {
        syncCollectionToMysql(changedColl, serialized[changedColl] || []).catch(() => {});
      }
    } catch (e) {
      console.error("[cPanelDB] Save error:", e.message);
    }
  }, 50);
}

async function syncCollectionToMysql(collName, docs) {
  try {
    const http = require("http");
    const payload = JSON.stringify({ collection: collName, docs });
    const req = http.request(PHP_MYSQL_SYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
      timeout: 5000,
    });
    req.on("error", () => {});
    req.write(payload);
    req.end();
  } catch {
    // ignore background mysql sync errors
  }
}

function getCollection(name) {
  if (!collections[name]) collections[name] = [];
  return collections[name];
}

function cloneDoc(doc) {
  return deserializeExtended(serializeExtended(doc));
}

function toComparableId(v) {
  if (!v) return v;
  if (v instanceof ObjectId || (v && v._bsontype === "ObjectId")) return v.toString();
  if (typeof v === "object" && v.$oid) return String(v.$oid);
  return v;
}

function getByPath(obj, pathStr) {
  const parts = pathStr.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur) && isNaN(Number(p))) {
      return cur.map((item) => (item ? item[p] : undefined));
    }
    cur = cur[p];
  }
  return cur;
}

function setByPath(obj, pathStr, val) {
  const parts = pathStr.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] === undefined || cur[p] === null || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = val;
}

function unsetByPath(obj, pathStr) {
  const parts = pathStr.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur || typeof cur !== "object") return;
    cur = cur[parts[i]];
  }
  if (cur && typeof cur === "object") {
    delete cur[parts[parts.length - 1]];
  }
}

function valuesEqual(a, b) {
  const ca = toComparableId(a);
  const cb = toComparableId(b);
  if (ca instanceof Date && cb instanceof Date) return ca.getTime() === cb.getTime();
  if (ca === cb) return true;
  if (Array.isArray(a) && !Array.isArray(b)) {
    return a.some((item) => valuesEqual(item, b));
  }
  return false;
}

function matchCondition(val, cond) {
  if (cond instanceof RegExp) {
    if (Array.isArray(val)) return val.some((v) => cond.test(String(v ?? "")));
    return cond.test(String(val ?? ""));
  }
  if (cond && cond._bsontype === "BSONRegExp") {
    const re = new RegExp(cond.pattern, cond.options || "");
    if (Array.isArray(val)) return val.some((v) => re.test(String(v ?? "")));
    return re.test(String(val ?? ""));
  }
  if (
    cond === null ||
    typeof cond !== "object" ||
    cond instanceof ObjectId ||
    cond._bsontype === "ObjectId" ||
    cond instanceof Date ||
    Array.isArray(cond)
  ) {
    return valuesEqual(val, cond);
  }

  const keys = Object.keys(cond);
  const hasOperator = keys.some((k) => k.startsWith("$"));
  if (!hasOperator) {
    return JSON.stringify(serializeExtended(val)) === JSON.stringify(serializeExtended(cond));
  }

  for (const op of keys) {
    const target = cond[op];
    switch (op) {
      case "$eq":
        if (!valuesEqual(val, target)) return false;
        break;
      case "$ne":
        if (valuesEqual(val, target)) return false;
        break;
      case "$in":
        if (!Array.isArray(target)) return false;
        if (Array.isArray(val)) {
          if (!val.some((v) => target.some((t) => matchCondition(v, t)))) return false;
        } else {
          if (!target.some((t) => matchCondition(val, t))) return false;
        }
        break;
      case "$nin":
        if (!Array.isArray(target)) return false;
        if (Array.isArray(val)) {
          if (val.some((v) => target.some((t) => matchCondition(v, t)))) return false;
        } else {
          if (target.some((t) => matchCondition(val, t))) return false;
        }
        break;
      case "$regex": {
        const flags = cond.$options || (target instanceof RegExp ? target.flags : "");
        const pattern = target instanceof RegExp ? target.source : target._bsontype === "BSONRegExp" ? target.pattern : String(target);
        const re = new RegExp(pattern, flags);
        if (Array.isArray(val)) {
          if (!val.some((v) => re.test(String(v ?? "")))) return false;
        } else {
          if (!re.test(String(val ?? ""))) return false;
        }
        break;
      }
      case "$options":
        break;
      case "$gt":
        if (!(val > target)) return false;
        break;
      case "$gte":
        if (!(val >= target)) return false;
        break;
      case "$lt":
        if (!(val < target)) return false;
        break;
      case "$lte":
        if (!(val <= target)) return false;
        break;
      case "$exists":
        if (Boolean(target) !== (val !== undefined)) return false;
        break;
      case "$all":
        if (!Array.isArray(val) || !Array.isArray(target)) return false;
        if (!target.every((t) => val.some((v) => valuesEqual(v, t)))) return false;
        break;
      case "$elemMatch":
        if (!Array.isArray(val)) return false;
        if (!val.some((item) => matchesQuery(item, target))) return false;
        break;
      case "$not":
        if (matchCondition(val, target)) return false;
        break;
      default:
        break;
    }
  }
  return true;
}

function matchesQuery(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, cond] of Object.entries(query)) {
    if (key === "$and") {
      if (!Array.isArray(cond) || !cond.every((q) => matchesQuery(doc, q))) return false;
    } else if (key === "$or") {
      if (!Array.isArray(cond) || !cond.some((q) => matchesQuery(doc, q))) return false;
    } else if (key === "$nor") {
      if (!Array.isArray(cond) || cond.some((q) => matchesQuery(doc, q))) return false;
    } else {
      const val = getByPath(doc, key);
      if (!matchCondition(val, cond)) return false;
    }
  }
  return true;
}

function applySort(docs, sortSpec) {
  if (!sortSpec || Object.keys(sortSpec).length === 0) return docs;
  const entries = Object.entries(sortSpec);
  return [...docs].sort((a, b) => {
    for (const [k, dir] of entries) {
      const va = getByPath(a, k);
      const vb = getByPath(b, k);
      const ca = va instanceof Date ? va.getTime() : toComparableId(va);
      const cb = vb instanceof Date ? vb.getTime() : toComparableId(vb);
      if (ca < cb) return -1 * dir;
      if (ca > cb) return 1 * dir;
    }
    return 0;
  });
}

function applyUpdate(doc, u, isInsert = false) {
  const keys = Object.keys(u || {});
  const hasOp = keys.some((k) => k.startsWith("$"));
  if (!hasOp) {
    const id = doc._id;
    for (const k of Object.keys(doc)) delete doc[k];
    Object.assign(doc, cloneDoc(u));
    if (id !== undefined && doc._id === undefined) doc._id = id;
    return;
  }
  if (u.$set) {
    for (const [k, v] of Object.entries(u.$set)) {
      setByPath(doc, k, cloneDoc(v));
    }
  }
  if (u.$setOnInsert && isInsert) {
    for (const [k, v] of Object.entries(u.$setOnInsert)) {
      if (getByPath(doc, k) === undefined) {
        setByPath(doc, k, cloneDoc(v));
      }
    }
  }
  if (u.$unset) {
    for (const k of Object.keys(u.$unset)) {
      unsetByPath(doc, k);
    }
  }
  if (u.$inc) {
    for (const [k, v] of Object.entries(u.$inc)) {
      const cur = Number(getByPath(doc, k) || 0);
      setByPath(doc, k, cur + Number(v));
    }
  }
  if (u.$push) {
    for (const [k, v] of Object.entries(u.$push)) {
      let arr = getByPath(doc, k);
      if (!Array.isArray(arr)) {
        arr = [];
        setByPath(doc, k, arr);
      }
      if (v && typeof v === "object" && Array.isArray(v.$each)) {
        arr.push(...cloneDoc(v.$each));
      } else {
        arr.push(cloneDoc(v));
      }
    }
  }
  if (u.$addToSet) {
    for (const [k, v] of Object.entries(u.$addToSet)) {
      let arr = getByPath(doc, k);
      if (!Array.isArray(arr)) {
        arr = [];
        setByPath(doc, k, arr);
      }
      const items = v && typeof v === "object" && Array.isArray(v.$each) ? v.$each : [v];
      for (const item of items) {
        if (!arr.some((x) => valuesEqual(x, item))) {
          arr.push(cloneDoc(item));
        }
      }
    }
  }
  if (u.$pull) {
    for (const [k, cond] of Object.entries(u.$pull)) {
      const arr = getByPath(doc, k);
      if (Array.isArray(arr)) {
        setByPath(
          doc,
          k,
          arr.filter((item) => !(typeof cond === "object" && cond !== null ? matchesQuery(item, cond) : valuesEqual(item, cond)))
        );
      }
    }
  }
}

function evalExpr(doc, expr) {
  if (expr === null || expr === undefined) return expr;
  if (typeof expr === "string") {
    if (expr.startsWith("$")) return getByPath(doc, expr.slice(1));
    return expr;
  }
  if (typeof expr === "object") {
    if (expr.$ifNull && Array.isArray(expr.$ifNull)) {
      for (const sub of expr.$ifNull) {
        const val = evalExpr(doc, sub);
        if (val !== null && val !== undefined) return val;
      }
      return null;
    }
    if (expr.$multiply && Array.isArray(expr.$multiply)) {
      return expr.$multiply.reduce((acc, item) => acc * Number(evalExpr(doc, item) || 0), 1);
    }
    if (expr.$add && Array.isArray(expr.$add)) {
      return expr.$add.reduce((acc, item) => acc + Number(evalExpr(doc, item) || 0), 0);
    }
    if (expr.$subtract && Array.isArray(expr.$subtract)) {
      return Number(evalExpr(doc, expr.$subtract[0]) || 0) - Number(evalExpr(doc, expr.$subtract[1]) || 0);
    }
  }
  return expr;
}

function runAggregate(coll, pipeline) {
  let docs = coll.map(cloneDoc);
  for (const stage of pipeline || []) {
    if (stage.$match) {
      docs = docs.filter((d) => matchesQuery(d, stage.$match));
    } else if (stage.$sort) {
      docs = applySort(docs, stage.$sort);
    } else if (stage.$skip !== undefined) {
      docs = docs.slice(Number(stage.$skip));
    } else if (stage.$limit !== undefined) {
      docs = docs.slice(0, Number(stage.$limit));
    } else if (stage.$unwind) {
      const pathSpec = typeof stage.$unwind === "string" ? stage.$unwind : stage.$unwind.path;
      const preserve = typeof stage.$unwind === "object" && stage.$unwind.preserveNullAndEmptyArrays;
      const field = pathSpec.replace(/^\$/, "");
      const next = [];
      for (const d of docs) {
        const val = getByPath(d, field);
        if (Array.isArray(val) && val.length > 0) {
          for (const item of val) {
            const copy = cloneDoc(d);
            setByPath(copy, field, item);
            next.push(copy);
          }
        } else if (preserve) {
          next.push(cloneDoc(d));
        }
      }
      docs = next;
    } else if (stage.$group) {
      const groups = new Map();
      const idSpec = stage.$group._id;
      for (const d of docs) {
        let groupKeyVal = null;
        if (idSpec === null) {
          groupKeyVal = null;
        } else if (typeof idSpec === "string" && idSpec.startsWith("$")) {
          groupKeyVal = getByPath(d, idSpec.slice(1));
        } else if (typeof idSpec === "object" && idSpec !== null) {
          groupKeyVal = {};
          for (const [gk, gv] of Object.entries(idSpec)) {
            groupKeyVal[gk] = evalExpr(d, gv);
          }
        } else {
          groupKeyVal = idSpec;
        }
        const keyStr = JSON.stringify(serializeExtended(groupKeyVal));
        if (!groups.has(keyStr)) {
          const init = { _id: groupKeyVal };
          for (const [fk, accSpec] of Object.entries(stage.$group)) {
            if (fk === "_id") continue;
            if (accSpec.$sum !== undefined) init[fk] = 0;
            else if (accSpec.$avg !== undefined) init[fk] = { sum: 0, count: 0 };
            else if (accSpec.$min !== undefined) init[fk] = undefined;
            else if (accSpec.$max !== undefined) init[fk] = undefined;
            else if (accSpec.$first !== undefined) init[fk] = undefined;
            else if (accSpec.$last !== undefined) init[fk] = undefined;
            else if (accSpec.$push !== undefined) init[fk] = [];
            else if (accSpec.$addToSet !== undefined) init[fk] = [];
          }
          groups.set(keyStr, init);
        }
        const g = groups.get(keyStr);
        for (const [fk, accSpec] of Object.entries(stage.$group)) {
          if (fk === "_id") continue;
          if (accSpec.$sum !== undefined) {
            const v = accSpec.$sum === 1 ? 1 : Number(evalExpr(d, accSpec.$sum) || 0);
            g[fk] += isNaN(v) ? 0 : v;
          } else if (accSpec.$avg !== undefined) {
            const v = Number(evalExpr(d, accSpec.$avg) || 0);
            if (!isNaN(v)) {
              g[fk].sum += v;
              g[fk].count += 1;
            }
          } else if (accSpec.$min !== undefined) {
            const v = evalExpr(d, accSpec.$min);
            if (g[fk] === undefined || v < g[fk]) g[fk] = v;
          } else if (accSpec.$max !== undefined) {
            const v = evalExpr(d, accSpec.$max);
            if (g[fk] === undefined || v > g[fk]) g[fk] = v;
          } else if (accSpec.$first !== undefined) {
            if (g[fk] === undefined) g[fk] = evalExpr(d, accSpec.$first);
          } else if (accSpec.$last !== undefined) {
            g[fk] = evalExpr(d, accSpec.$last);
          } else if (accSpec.$push !== undefined) {
            g[fk].push(evalExpr(d, accSpec.$push));
          } else if (accSpec.$addToSet !== undefined) {
            const v = evalExpr(d, accSpec.$addToSet);
            if (!g[fk].some((x) => valuesEqual(x, v))) g[fk].push(v);
          }
        }
      }
      docs = Array.from(groups.values()).map((g) => {
        for (const [fk, accSpec] of Object.entries(stage.$group)) {
          if (fk !== "_id" && accSpec.$avg !== undefined) {
            g[fk] = g[fk].count > 0 ? g[fk].sum / g[fk].count : 0;
          }
        }
        return g;
      });
    } else if (stage.$count) {
      docs = [{ [stage.$count]: docs.length }];
    }
  }
  return docs;
}

function handleCommand(cmd) {
  const dbName = cmd.$db || "ekosmart_Feedback";
  if (cmd.hello || cmd.ismaster || cmd.isMaster) {
    return {
      ismaster: true,
      helloOk: true,
      maxBsonObjectSize: 16777216,
      maxMessageSizeBytes: 48000000,
      maxWriteBatchSize: 100000,
      localTime: new Date(),
      logicalSessionTimeoutMinutes: 30,
      connectionId: 1,
      minWireVersion: 0,
      maxWireVersion: 17,
      readOnly: false,
      ok: 1,
    };
  }
  if (cmd.ping || cmd.endSessions || cmd.abortTransaction || cmd.commitTransaction || cmd.saslStart || cmd.saslContinue) {
    return { ok: 1 };
  }
  if (cmd.buildInfo || cmd.buildinfo) {
    return { version: "6.0.0", versionArray: [6, 0, 0, 0], ok: 1 };
  }
  if (cmd.createIndexes || cmd.dropIndexes || cmd.create) {
    return { ok: 1 };
  }
  if (cmd.listIndexes) {
    return {
      cursor: { id: Long.ZERO, ns: `${dbName}.${cmd.listIndexes}`, firstBatch: [{ v: 2, key: { _id: 1 }, name: "_id_" }] },
      ok: 1,
    };
  }
  if (cmd.listCollections) {
    const firstBatch = Object.keys(collections).map((name) => ({ name, type: "collection" }));
    return {
      cursor: { id: Long.ZERO, ns: `${dbName}.$cmd.listCollections`, firstBatch },
      ok: 1,
    };
  }

  if (cmd.find) {
    const collName = cmd.find;
    const coll = getCollection(collName);
    let results = coll.filter((d) => matchesQuery(d, cmd.filter || {})).map(cloneDoc);
    if (cmd.sort) results = applySort(results, cmd.sort);
    if (cmd.skip) results = results.slice(Number(cmd.skip));
    if (cmd.limit) results = results.slice(0, Number(cmd.limit));
    return {
      cursor: {
        id: Long.ZERO,
        ns: `${dbName}.${collName}`,
        firstBatch: results,
      },
      ok: 1,
    };
  }

  if (cmd.insert) {
    const collName = cmd.insert;
    const coll = getCollection(collName);
    const docs = cmd.documents || [];
    let count = 0;
    for (const rawDoc of docs) {
      const doc = cloneDoc(rawDoc);
      if (doc._id === undefined) doc._id = new ObjectId();
      coll.push(doc);
      count++;
    }
    scheduleSave(collName);
    return { n: count, ok: 1 };
  }

  if (cmd.update) {
    const collName = cmd.update;
    const coll = getCollection(collName);
    const updates = cmd.updates || [];
    let matchedCount = 0;
    let modifiedCount = 0;
    const upserted = [];
    updates.forEach((uSpec, idx) => {
      const q = uSpec.q || {};
      const u = uSpec.u || {};
      const multi = Boolean(uSpec.multi);
      const upsert = Boolean(uSpec.upsert);
      const matched = [];
      for (const doc of coll) {
        if (matchesQuery(doc, q)) {
          matched.push(doc);
          if (!multi) break;
        }
      }
      if (matched.length > 0) {
        matchedCount += matched.length;
        for (const doc of matched) {
          applyUpdate(doc, u, false);
          modifiedCount++;
        }
      } else if (upsert) {
        const newDoc = { _id: new ObjectId() };
        for (const [qk, qv] of Object.entries(q)) {
          if (!qk.startsWith("$") && (qv === null || typeof qv !== "object" || qv instanceof ObjectId || qv._bsontype === "ObjectId" || qv instanceof Date)) {
            setByPath(newDoc, qk, cloneDoc(qv));
          }
        }
        applyUpdate(newDoc, u, true);
        if (newDoc._id === undefined) newDoc._id = new ObjectId();
        coll.push(newDoc);
        upserted.push({ index: idx, _id: newDoc._id });
      }
    });
    scheduleSave(collName);
    const res = { n: matchedCount + upserted.length, nModified: modifiedCount, ok: 1 };
    if (upserted.length > 0) res.upserted = upserted;
    return res;
  }

  if (cmd.findAndModify || cmd.findandmodify) {
    const collName = cmd.findAndModify || cmd.findandmodify;
    const coll = getCollection(collName);
    const q = cmd.query || {};
    let candidates = coll.filter((d) => matchesQuery(d, q));
    if (cmd.sort) candidates = applySort(candidates, cmd.sort);
    const target = candidates[0];
    if (cmd.remove) {
      if (target) {
        const idx = coll.indexOf(target);
        if (idx !== -1) coll.splice(idx, 1);
        scheduleSave(collName);
        return { value: cloneDoc(target), lastErrorObject: { n: 1 }, ok: 1 };
      }
      return { value: null, lastErrorObject: { n: 0 }, ok: 1 };
    }
    if (target) {
      const before = cloneDoc(target);
      applyUpdate(target, cmd.update || {}, false);
      scheduleSave(collName);
      return {
        value: cmd.new ? cloneDoc(target) : before,
        lastErrorObject: { n: 1, updatedExisting: true },
        ok: 1,
      };
    } else if (cmd.upsert) {
      const newDoc = { _id: new ObjectId() };
      for (const [qk, qv] of Object.entries(q)) {
        if (!qk.startsWith("$") && (qv === null || typeof qv !== "object" || qv instanceof ObjectId || qv._bsontype === "ObjectId" || qv instanceof Date)) {
          setByPath(newDoc, qk, cloneDoc(qv));
        }
      }
      applyUpdate(newDoc, cmd.update || {}, true);
      if (newDoc._id === undefined) newDoc._id = new ObjectId();
      coll.push(newDoc);
      scheduleSave(collName);
      return {
        value: cmd.new ? cloneDoc(newDoc) : null,
        lastErrorObject: { n: 1, updatedExisting: false, upserted: newDoc._id },
        ok: 1,
      };
    }
    return { value: null, lastErrorObject: { n: 0, updatedExisting: false }, ok: 1 };
  }

  if (cmd.delete) {
    const collName = cmd.delete;
    const coll = getCollection(collName);
    let deleted = 0;
    for (const dSpec of cmd.deletes || []) {
      const q = dSpec.q || {};
      const limit = Number(dSpec.limit || 0);
      for (let i = coll.length - 1; i >= 0; i--) {
        if (matchesQuery(coll[i], q)) {
          coll.splice(i, 1);
          deleted++;
          if (limit === 1) break;
        }
      }
    }
    scheduleSave(collName);
    return { n: deleted, ok: 1 };
  }

  if (cmd.count) {
    const collName = cmd.count;
    const coll = getCollection(collName);
    const matched = coll.filter((d) => matchesQuery(d, cmd.query || {})).length;
    return { n: matched, ok: 1 };
  }

  if (cmd.distinct) {
    const collName = cmd.distinct;
    const coll = getCollection(collName);
    const key = cmd.key;
    const matched = coll.filter((d) => matchesQuery(d, cmd.query || {}));
    const vals = [];
    for (const d of matched) {
      const v = getByPath(d, key);
      if (Array.isArray(v)) {
        for (const item of v) {
          if (!vals.some((x) => valuesEqual(x, item))) vals.push(item);
        }
      } else if (v !== undefined) {
        if (!vals.some((x) => valuesEqual(x, v))) vals.push(v);
      }
    }
    return { values: vals, ok: 1 };
  }

  if (cmd.aggregate) {
    const collName = cmd.aggregate;
    const coll = getCollection(collName);
    const out = runAggregate(coll, cmd.pipeline || []);
    return {
      cursor: {
        id: Long.ZERO,
        ns: `${dbName}.${collName}`,
        firstBatch: out,
      },
      ok: 1,
    };
  }

  return { ok: 1 };
}

function parseOpMsg(buf) {
  let offset = 20; // 16-byte header + 4-byte flagBits
  let bodyDoc = {};
  while (offset < buf.length) {
    const kind = buf[offset];
    offset += 1;
    if (kind === 0) {
      const docSize = buf.readInt32LE(offset);
      const docBuf = buf.subarray(offset, offset + docSize);
      Object.assign(bodyDoc, BSON.deserialize(docBuf));
      offset += docSize;
    } else if (kind === 1) {
      const secSize = buf.readInt32LE(offset);
      const secEnd = offset + secSize;
      offset += 4;
      const cstrEnd = buf.indexOf(0, offset);
      const identifier = buf.subarray(offset, cstrEnd).toString("utf8");
      offset = cstrEnd + 1;
      const arr = [];
      while (offset < secEnd) {
        const dSize = buf.readInt32LE(offset);
        arr.push(BSON.deserialize(buf.subarray(offset, offset + dSize)));
        offset += dSize;
      }
      bodyDoc[identifier] = arr;
    } else {
      break;
    }
  }
  return bodyDoc;
}

function buildOpMsgResponse(requestId, responseObj) {
  const bsonPayload = BSON.serialize(responseObj);
  const totalLength = 16 + 4 + 1 + bsonPayload.length;
  const out = Buffer.allocUnsafe(totalLength);
  out.writeInt32LE(totalLength, 0);
  out.writeInt32LE(requestId + 1, 4);
  out.writeInt32LE(requestId, 8);
  out.writeInt32LE(2013, 12); // OP_MSG
  out.writeUInt32LE(0, 16); // flagBits
  out[20] = 0; // section kind 0
  bsonPayload.copy(out, 21);
  return out;
}

function buildOpReplyResponse(requestId, responseObj) {
  const bsonPayload = BSON.serialize(responseObj);
  const totalLength = 16 + 20 + bsonPayload.length;
  const out = Buffer.allocUnsafe(totalLength);
  out.writeInt32LE(totalLength, 0);
  out.writeInt32LE(requestId + 1, 4);
  out.writeInt32LE(requestId, 8);
  out.writeInt32LE(1, 12); // OP_REPLY
  out.writeInt32LE(0, 16); // responseFlags
  out.writeBigInt64LE(0n, 20); // cursorID
  out.writeInt32LE(0, 28); // startingFrom
  out.writeInt32LE(1, 32); // numberReturned
  bsonPayload.copy(out, 36);
  return out;
}

let serverPromise = null;
const BOUND_PORT = 27018;

function runDaemonServer() {
  loadFromDisk();
  const srv = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 16) {
        const msgLen = buffer.readInt32LE(0);
        if (buffer.length < msgLen) break;
        const msgBuf = buffer.subarray(0, msgLen);
        buffer = buffer.subarray(msgLen);

        const requestId = msgBuf.readInt32LE(4);
        const opCode = msgBuf.readInt32LE(12);
        try {
          if (opCode === 2013) {
            const cmd = parseOpMsg(msgBuf);
            const reply = handleCommand(cmd);
            socket.write(buildOpMsgResponse(requestId, reply));
          } else if (opCode === 2004) {
            let offset = 20;
            const cstrEnd = msgBuf.indexOf(0, offset);
            offset = cstrEnd + 1 + 8;
            const dSize = msgBuf.readInt32LE(offset);
            const cmd = BSON.deserialize(msgBuf.subarray(offset, offset + dSize));
            const reply = handleCommand(cmd);
            socket.write(buildOpReplyResponse(requestId, reply));
          }
        } catch (err) {
          console.error("[cPanelDB] Command error:", err);
          socket.write(buildOpMsgResponse(requestId, { ok: 0, errmsg: err.message }));
        }
      }
    });
    socket.on("error", () => {});
  });

  srv.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      process.exit(0);
    }
  });

  srv.listen(BOUND_PORT, "127.0.0.1", () => {
    console.log(`[cPanelDB] Standalone cPanel Database Daemon (ekosmart_Feedback) listening on 127.0.0.1:${BOUND_PORT}`);
  });
}

if (require.main === module) {
  runDaemonServer();
}

function checkPortOpen(port) {
  return new Promise((resolve) => {
    const sock = net.createConnection({ port, host: "127.0.0.1", timeout: 400 }, () => {
      sock.destroy();
      resolve(true);
    });
    sock.on("error", () => {
      sock.destroy();
      resolve(false);
    });
    sock.on("timeout", () => {
      sock.destroy();
      resolve(false);
    });
  });
}

async function startCpanelDbServer() {
  const uri = `mongodb://127.0.0.1:${BOUND_PORT}/ekosmart_Feedback?directConnection=true`;
  if (await checkPortOpen(BOUND_PORT)) {
    return uri;
  }
  try {
    const { spawn } = require("child_process");
    const child = spawn(process.execPath, [__filename, "--daemon"], {
      detached: true,
      stdio: "ignore",
      env: { ...process.env },
    });
    child.unref();
  } catch (e) {
    console.error("[cPanelDB] Spawn error, falling back to in-process:", e.message);
    runDaemonServer();
  }
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 150));
    if (await checkPortOpen(BOUND_PORT)) {
      return uri;
    }
  }
  return uri;
}

module.exports = { startCpanelDbServer, getCollections: () => collections, scheduleSave };
