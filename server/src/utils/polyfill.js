
// Polyfill for DOMMatrix for pdfjs-dist in Node.js environment
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor(init) {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
            if (Array.isArray(init)) {
                this.a = init[0];
                this.b = init[1];
                this.c = init[2];
                this.d = init[3];
                this.e = init[4];
                this.f = init[5];
            }
        }

        multiply(other) {
            const result = new DOMMatrix();
            result.a = this.a * other.a + this.b * other.c;
            result.b = this.a * other.b + this.b * other.d;
            result.c = this.c * other.a + this.d * other.c;
            result.d = this.c * other.b + this.d * other.d;
            result.e = this.e * other.a + this.f * other.c + this.e;
            result.f = this.e * other.b + this.f * other.d + this.f;
            return result;
        }

        translate(tx, ty) {
            const result = new DOMMatrix([this.a, this.b, this.c, this.d, this.e, this.f]);
            result.e += result.a * tx + result.c * ty;
            result.f += result.b * tx + result.d * ty;
            return result;
        }

        scale(sx, sy, sz, originX, originY, originZ) {
            const result = new DOMMatrix([this.a * sx, this.b * sx, this.c * sy, this.d * sy, this.e, this.f]);
            return result;
        }
    };
}
