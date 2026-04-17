import React from 'react';
import { useSelector } from 'react-redux';
import { SectionTitle, AnimatedPageWrapper } from '../common/UIComponents';
import ProjectSummaryCard from './summary/ProjectSummaryCard';
import FunctionsSummary from './summary/FunctionsSummary';
import ProductsTable from './summary/ProductsTable';
import ServicesTable from './summary/ServicesTable';
import FinancialSummary from './summary/FinancialSummary';
import OfferConditions from './summary/OfferConditions';
import DisclaimerSection from './summary/DisclaimerSection';
import CustomerComments from './summary/CustomerComments';
import GenerateOfferSection from './summary/GenerateOfferSection';
import { useTranslation } from 'react-i18next';

export default function SummaryStep() {
    const { t } = useTranslation();
    const { projectInfo, levels, customerComments } = useSelector(state => state.configurator);
    const levelsCount = levels?.length || 0;

    return (
        <AnimatedPageWrapper className="space-y-6 pb-20 max-w-5xl mx-auto">
            <SectionTitle
                title={t('configurator.summary.title', 'Project Summary')}
                subtitle={t('configurator.summary.subtitle', 'Review the final project, functions, calculated products, services, totals, and offer notes before generating the offer.')}
                badge={t('configurator.summary.badge', 'Step 07: Summary')}
            />

            <ProjectSummaryCard projectInfo={projectInfo} levelsCount={levelsCount} />
            <FunctionsSummary levels={levels} />
            <ProductsTable />
            <ServicesTable />
            <FinancialSummary />
            <OfferConditions />
            <DisclaimerSection />
            <CustomerComments comments={customerComments} />

            <GenerateOfferSection />
        </AnimatedPageWrapper>
    );
}
