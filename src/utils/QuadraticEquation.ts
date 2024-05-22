function quadraticEquation(a: number, b: number, c: number) {
    let delta, x1, x2 : number
   
    if(a === 0) {
        return 'It\'s not a quadratic equation'
    }

    delta = b*b - 4*a*c

    if (delta < 0) {
        return 'Quadratic equation with no real solutions'
    } else if (delta === 0 ) {
        return `Quadratic equations with double roots: x1 = x2 = ${-b/2*a}`
    } else {
        x1 = (-b + Math.sqrt(delta)) / (2*a)
        x2 = (-b - Math.sqrt(delta)) / (2*a)
        return `Quadratic equation has two distinct real roots,: x1 = ${x1.toFixed(1)} va x2 = ${x2.toFixed(1)}`
    }

    
}

export default quadraticEquation