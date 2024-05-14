export const Range = ({min=0, max=1, start=0, step=1}) => {
    let current = start;

    const next = () => {
        return current = verify(step);
    };

    const nextBy = (nStep) => {
        return current = verify(nStep);
    };

    const prevBy = (nStep) => {
        return current = verify(-nStep);
    };

    const verify = (stepCnt) => {
        let newCurrent = current + stepCnt;

        return newCurrent < min
            ? min
            : (
                newCurrent > max
                    ? max
                    : newCurrent
            );
    };

    return {
        next: () => next(),
        nextBy: (nStep) => nextBy(nStep),
        prevBy: (nStep) => prevBy(nStep)
    };
};