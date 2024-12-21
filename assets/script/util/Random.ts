/**
 * 可包含种子的随机 算法 Mulberry32
 * const seed = 1; // 随意整数
 * const random = new Random()
 * console.log(random.random()); // 0.6270739405881613
 * console.log(random.random()); // 0.002735721180215478
 * console.log(random.random()); // 0.5274470399599522
 *
 */

export class Random {

    public static inst = new Random(Math.random() * 10000);

    constructor (seed?: number) {
        this._seed = seed;
    }

    /**
     * 0～1的随机float
     */
    public random (): number {
        if (this._seed == null) return Math.random();

        let for_bit32_mul = this._seed += 0x6D2B79F5;
        let cast32_one = for_bit32_mul ^ for_bit32_mul >>> 15;
        let cast32_two = for_bit32_mul | 1;
        for_bit32_mul = Math.imul(cast32_one, cast32_two);
        for_bit32_mul ^= for_bit32_mul + Math.imul(for_bit32_mul ^ for_bit32_mul >>> 7, for_bit32_mul | 61);
        return ((for_bit32_mul ^ for_bit32_mul >>> 14) >>> 0) / 4294967296;
    }

    /**
     * min~max之间的随机float
     * @param min
     * @param max
     */
    public randomFloat (min: number, max: number): number {
        return min + this.random() * (max - min);
    }

    /**
     * min~max之间包含min&max的随机integer
     * @param min
     * @param max
     */
    public randomInt (min: number, max: number) {
        const ret = min + Math.floor((max - min + 1) * this.random());
        return (ret > max) ? max : ret;
    }

    /**
     * 随机打乱array
     * @param array
     */
    public shuffleArray<T> (array: Array<T>): Array<T> {
        const len = array.length;
        for (let i = 0; i < len - 1; i++) {
            const index = this.randomInt(0, len - 1);
            let temp = array[index];
            array[index] = array[len - i - 1];
            array[len - i - 1] = temp;
        }
        return array;
    }

    private _seed: number;
}

const win = window as any;

if (win.Random == null) {
    win.Random = Random;
}