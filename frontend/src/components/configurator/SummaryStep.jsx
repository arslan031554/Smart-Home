import React from 'react';
import { useSelector } from 'react-redux';
import { SectionTitle, AnimatedPageWrapper } from '../common/UIComponents';
import ProjectSummaryCard from './summary/ProjectSummaryCard';
import RoomsSummary from './summary/RoomsSummary';
import RoomFunctionsSummary from './summary/RoomFunctionsSummary';
import FunctionsSummary from './summary/FunctionsSummary';
import RangeColorSummary from './summary/RangeColorSummary';
import ProductsTable from './summary/ProductsTable';
import ServicesTable from './summary/ServicesTable';
import FinancialSummary from './summary/FinancialSummary';
import OfferConditions from './summary/OfferConditions';
import OfferReviewNotes from './summary/OfferReviewNotes';
import CustomerComments from './summary/CustomerComments';
import { useTranslation } from 'react-i18next';

export default function SummaryStep() {
    const { t } = useTranslation();
    const { projectInfo, levels, range, color, customerComments } = useSelector(state => state.configurator);
    const levelsCount = levels?.length || 0;

    return (
        <AnimatedPageWrapper className="mx-auto max-w-5xl space-y-4 pb-16 sm:space-y-5 sm:pb-20">
            <SectionTitle
                title={t('configurator.summary.title', 'Project Summary')}
                subtitle={t('configurator.summary.subtitle', 'Review the final project, functions, calculated products, services, totals, and offer notes before generating the offer.')}
                badge={t('configurator.summary.badge', 'Step 06: Summary')}
            />

            <ProjectSummaryCard projectInfo={projectInfo} levelsCount={levelsCount} />
            <RoomsSummary levels={levels} />
            <RoomFunctionsSummary levels={levels} />
            <FunctionsSummary levels={levels} />
            <RangeColorSummary range={range} color={color} />
            <ProductsTable />
            <ServicesTable />
            <FinancialSummary />
            <OfferConditions />
            <CustomerComments comments={customerComments} />
            <OfferReviewNotes />
        </AnimatedPageWrapper>
    );
}
