import quadraticEquation from "../../utils/QuadraticEquation"

describe('test quadratic equation', () => {
    test('should return a specific message when \'a\' is zero', () => {
        expect(quadraticEquation(0, 1, 2)).toBe('It\'s not a quadratic equation')
    })

    test('should return two distinct real roots when delta is positive', () => {
        expect(quadraticEquation(1, -3, 2)).toBe('Quadratic equation has two distinct real roots,: x1 = 2.0 va x2 = 1.0')
    })

    test('should return message indicating no real solutions when delta is negative', () => {
        const result = quadraticEquation(1, 2, 3);
        expect(result).toBe('Quadratic equation with no real solutions');
    });

    test('should return double roots when delta is zero', () => {
        const result = quadraticEquation(1, -2, 1);
        expect(result).toBe('Quadratic equations with double roots: x1 = x2 = 1');
    });

    test('should solve quadratic equation with floating-point coefficients', () => {
        const result = quadraticEquation(1.5, -2.5, 1.2);
        expect(result).toBe('Quadratic equation with no real solutions');
    });

    test("should return double roots: x1 = x2 = 0 when 'a' is not zero and 'b' and 'c' are zero", () => {
        const result = quadraticEquation(1, 0, 0);
        expect(result).toBe("Quadratic equations with double roots: x1 = x2 = 0");
    });

})