declare type BufferData = Uint8Array | Uint16Array | Uint32Array | Float32Array;
export declare class BufferAttrib {
    name: string | null;
    size: number;
    data: BufferData | null;
    type: number;
    normalized: boolean;
    offset: number;
    stride: number;
    usage: number;
    target: number;
    buffer: WebGLBuffer | null;
    gl: WebGL2RenderingContext | null;
    program: WebGLProgram | null;
    constructor(name: string | null, size: number, data?: BufferData | null, type?: number, normalized?: boolean, offset?: number, stride?: number, usage?: number, target?: number);
    static getCount(buffers: BufferAttrib[]): {
        count: number;
        indexType: number;
    };
    use({ gl, program, }: {
        gl: WebGL2RenderingContext | null;
        program: WebGLProgram | null;
    }): this;
    update(data?: Uint16Array | Uint32Array | Float32Array | null | undefined): this;
    enable(): this;
    disable(): this;
    dispose(): void;
}
export {};
