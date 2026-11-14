const extendObj = (target, source) => {
    for (const key of Object.keys(source)) {
        const sourceValue = source[key];

        if (
            sourceValue &&
            typeof sourceValue === "object" &&
            !Array.isArray(sourceValue)
        ) {
            target[key] = extendObj(
                target[key] && typeof target[key] === "object" && !Array.isArray(target[key])
                    ? target[key]
                    : {},
                sourceValue
            );
        } else {
            target[key] = sourceValue;
        }
    }

    return target;
};