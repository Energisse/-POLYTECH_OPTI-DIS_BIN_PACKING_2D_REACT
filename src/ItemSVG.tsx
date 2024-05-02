export default function ItemSVG({id,x,y,width,height,transitionDuration,color}: {id:number; x: number; y: number; width: number; height: number; color:string; transitionDuration:number }) {
    return (
        <>
            <rect
                width={width}
                height={height}
                fill={color}
                  style={{
                    transform: `translate(${x}px,${y}px)`,
                    transition: `all ${transitionDuration}s` // Apply transition to all properties
                }}
            />
            <text
                fill="#000000"
                fontSize="20"
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{
                    transform: `translate(${x + (width / 2)}px,${y + (height / 2)}px)`,
                    transition: `all ${transitionDuration}s` // Apply transition to all properties
                }}
            >{id}</text>
        </>
    )
} 