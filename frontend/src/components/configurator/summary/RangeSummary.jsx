import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'lucide-react';
import { Card } from '../../common/UIComponents';

export default function RangeSummary({ range: rangeId }) {
    const ranges = useSelector((state) => state.admin.productRanges?.length ? state.admin.productRanges : state.admin.publicProductRanges || []);
    const range = ranges.find((item) => item.id === rangeId);
    return React.createElement(
        Card,
        { className: 'p-5' },
        React.createElement(Box, { className: 'h-5 w-5 text-primary-700' }),
        React.createElement('span', { className: 'ml-3 font-bold text-textPrimary' }, range?.name || 'Standard Range'),
    );
}
