'use client';
import { usePlans, useSubscription, useStatements } from '@clerk/nextjs';

export default function Home() {
  const { data: plans, count: planCount } = usePlans();
  const { data: subscription } = useSubscription();
  const { data: statements, count: statementCount } = useStatements();
  return (
    <main>
      {plans?.map(plan => (
        <div key={plan.id}>
          <h2>Plan: {plan.name}</h2>
          <p>{plan.description}</p>
        </div>
      ))}

      {planCount > 0 ? <p>Plans found</p> : <p>No plans found</p>}

      {statements?.map(statement => (
        <div key={statement.id}>
          <p>Statement total: {statement.totals.grandTotal.amountFormatted}</p>
        </div>
      ))}

      {statementCount > 0 ? <p>Statements found</p> : <p>No statements found</p>}

      {subscription ? (
        <div>
          <h2>Subscribed to {subscription.subscriptionItems[0].plan.name}</h2>
        </div>
      ) : (
        <p>No subscription found</p>
      )}
    </main>
  );
}
