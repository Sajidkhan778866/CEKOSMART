"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDateFilterToQuery = exports.getDateFilterBounds = void 0;
const getDateFilterBounds = (filter, customStart, customEnd) => {
    if (!filter || filter === 'all' || filter === 'All' || filter === 'alltime') {
        if (customStart || customEnd) {
            const range = {};
            if (customStart)
                range.startDate = new Date(customStart);
            if (customEnd) {
                const e = new Date(customEnd);
                e.setHours(23, 59, 59, 999);
                range.endDate = e;
            }
            return range;
        }
        return {};
    }
    const now = new Date();
    const lower = filter.toLowerCase().replace(/\s+/g, '');
    if (lower === 'today') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
    }
    if (lower === 'yesterday') {
        const start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
    }
    if (lower === 'last7days' || lower === '7days' || lower === 'week') {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
    }
    if (lower === 'last30days' || lower === '30days' || lower === 'month') {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { startDate: start, endDate: end };
    }
    if (lower === 'thismonth' || lower === 'currentmonth') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { startDate: start, endDate: end };
    }
    if (lower === 'custom' || customStart || customEnd) {
        const range = {};
        if (customStart) {
            range.startDate = new Date(customStart);
        }
        if (customEnd) {
            const e = new Date(customEnd);
            e.setHours(23, 59, 59, 999);
            range.endDate = e;
        }
        return range;
    }
    return {};
};
exports.getDateFilterBounds = getDateFilterBounds;
const applyDateFilterToQuery = (query, dateField, filter, customStart, customEnd) => {
    const { startDate, endDate } = (0, exports.getDateFilterBounds)(filter, customStart, customEnd);
    if (startDate || endDate) {
        query[dateField] = query[dateField] || {};
        if (startDate)
            query[dateField].$gte = startDate;
        if (endDate)
            query[dateField].$lte = endDate;
    }
};
exports.applyDateFilterToQuery = applyDateFilterToQuery;
