/// <reference types="vite/client" />

// declare .glb
declare module '*.glb' {
    const value: string
    export default value
}
