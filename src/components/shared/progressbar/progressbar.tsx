import { useState, PropsWithChildren, useEffect } from "react";
import { Progress, Button } from "@chakra-ui/react";

interface Props {
    title: string,
    subtitle: string,
    actualProgress: number,
    updateProgress: (update: any) => void
}

export function ProgressBar({title, subtitle, actualProgress, updateProgress}: Props) {
    const [currentProgress, setCurrentProgress] = useState(0);

    useEffect(() => {
        setCurrentProgress(actualProgress);
    }, [actualProgress])
    return (
        <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
                <Progress
                    value={currentProgress}
                    hasStripe={true}
                    isAnimated={true}
                    width={"80"}
                    color={"orange.300"}
                    backgroundColor={"orange.300"}
                    borderRadius={20}
                />
        </div>
    );
}