import { useState } from 'react';

// This was an attempt to write a function that would clean up the step-by-step
// nature of the CLI but I couldn't get it working the way I wanted quick enough
// so shelving it for now.
export function createStepSequence() {
	const [step, setStep] = useState(0);

	const StepSequence = ({ children }) => {
		const stepToRender = [].concat(children).filter((_, idx) => {
			return idx === step;
		});
		if (!stepToRender.length) return [];

		if (stepToRender[0].props.condition === false) {
			setStep(step + 1);
		} else {
			return stepToRender;
		}
	};

	const Step = ({ condition, children }) => {
		return children;
	};

	const nextStep = () => {
		setStep(step + 1);
	};

	return [StepSequence, Step, nextStep];
}
