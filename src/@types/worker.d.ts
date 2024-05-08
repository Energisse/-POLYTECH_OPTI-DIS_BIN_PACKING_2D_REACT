import { Metaheuristiques, MetaheuristiqueConfigs, MetaheuristiqueStatistic, BinPackingSvgs } from "../reducers/metaheuristique"

export interface MainToWorkerEventMap {
    "message": MessageEvent<{
        type: string
        data: any
    }>;
    "init": CustomEvent<{
        rawDataSet: string,
        metaheuristique: Metaheuristiques,
        config?: MetaheuristiqueConfigs,
        speed: {
            interval: number,
            iterationCount: number
        }
    }>;
    "start": CustomEvent<void>;
    "pause": CustomEvent<void>;
    "stop": CustomEvent<void>;
    "speed": CustomEvent<{
        interval: number,
        iterationCount: number
    }>;
    "config": CustomEvent<MetaheuristiqueConfigs>;
}

export interface WorkerToMainEventMap {
    "message": MessageEvent<{
        type: string
        data: any,
    }>;
    "done": CustomEvent<void>;
    "config": CustomEvent<MetaheuristiqueConfigs>;
    "stats": CustomEvent<MetaheuristiqueStatistic[]>;
    "solution": CustomEvent<BinPackingSvgs[]>;

}

declare global {
    interface DedicatedWorkerGlobalScope {
        emit<K extends keyof WorkerToMainEventMap>(...args: WorkerToMainEventMap[K]["detail"] extends void ? [type: K] : [type: K, data: WorkerToMainEventMap[K]["detail"]]): void;
        addEventListener<K extends keyof MainToWorkerEventMap>(type: K,
            listener: (this: Document, ev: MainToWorkerEventMap[K]) => void): void;
        dispatchEvent<K extends keyof MainToWorkerEventMap>(ev: MainToWorkerEventMap[K]): void;
    }

    interface Worker {
        emit<K extends keyof MainToWorkerEventMap>(...args: MainToWorkerEventMap[K]["detail"] extends void ? [type: K] : [type: K, data: MainToWorkerEventMap[K]["detail"]]): void;
        addEventListener<K extends keyof WorkerToMainEventMap>(type: K,
            listener: (this: Document, ev: WorkerToMainEventMap[K]) => void): void;
        dispatchEvent<K extends keyof WorkerToMainEventMap>(ev: WorkerToMainEventMap[K]): void;
    }
}

DedicatedWorkerGlobalScope.prototype.emit = function (message) {
    this.postMessage(message);
};


export { }; //this is needed to make this file a module