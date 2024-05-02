type Bin = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type BinSVGProps = Bin &  {
    transitionDuration: number;
} 

export default function BinSVG({x,y,width,height,transitionDuration}: BinSVGProps) {
    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="none"
            stroke="red"
            style={{
                transition: `all ${transitionDuration}s` // Apply transition to all properties
            }}
        />
    )
}