/*
 * Used to chain multiple functions and pass the output of one to the next one in the chain.
 * It is similar to the Unix pipe operator and will apply all functions left-to-right by using the JavaScript reduce() function
 * Example:
 *  Create a piped function that applies the three functions in the correct order:
 *  const decorated1 = pipe(addPrefix, addSuffix, toUppercase);
 *  Call the piped function with the input string:
 *  const result1 = decorated1("hello");
 * */

export function pipe(...funcs) {
    return function piped(...args) {
        return funcs.reduce((result, func) => [func.call(this, ...result)], args)[0];
    };
}

/*
 * The Compose function is the same as the Pipe function, but it will use reduceRight to apply all functions:
 */
export function compose(...funcs) {
    return function composed(...args) {
        return funcs.reduceRight((result, func) => [func.call(this, ...result)], args)[0];
    };
}

/*
 *  Used to select specific values from an object.
 *  It is a way to create a new object by selecting certain properties from a provided project.
 *  It is a functional programming technique that allows extracting a subset of properties from any object if the properties are available.
 *  Example:
 *  const selected = pick(obj, ['name', 'website']);
 *  console.log(selected); // { name: 'Paul', website: 'https://www.paulsblog.dev' }
 */
export function pick(obj, keys) {
    return keys.reduce((acc, key) => {
        if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}

/*
 * The Zip function is a JavaScript function that matches each passed array of elements
 * to another array element and is used to combine multiple arrays into a single array of tuples
 * Example:
 * The Omit function is the opposite of the Pick function, as it will remove certain properties from an existing object
 * Example:
 * const selected = omit(obj, ['id']);
 * console.log(selected); // {name: 'Paul', job: 'Senior Engineer'}  it not contain the id property
 */
export function omit(obj, keys) {
    return Object.keys(obj)
        .filter(key => !keys.includes(key))
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

/*
* const xCoordinates = [1, 2, 3, 4];
* const yCoordinates = [5, 6, 7, 8];
* const zCoordinates = [3, 6, 1, 7];
  // Create a zipped array of points
* const points = zip(xCoordinates, yCoordinates, zCoordinates);
  // Use the zipped array of points
* console.log(points);  // [[1, 5, 3], [2, 6, 6], [3, 7, 1], [4, 8, 7]]
* */
export function zip(...arrays) {
    const maxLength = Math.max(...arrays.map(array => array.length));
    return Array.from({ length: maxLength }).map((_, i) => {
        return Array.from({ length: arrays.length }, (_, j) => arrays[j][i]);
    });
}

/* Make a Map from an object
 * Example:
 * const myMap = makeMap({ key: 'value' })
 * */
export const makeMap = <V = unknown>(obj: Record<string, V>) => new Map<string, V>(Object.entries(obj));
