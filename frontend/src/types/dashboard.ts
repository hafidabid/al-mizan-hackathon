export interface SelectedProject {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  field: string;
  isTrained: boolean;
  beforeTrain: string;
  afterTrain: string;
  metadata: {
    id: string;
    collectionId: string;
    collectionName: string;
    title: string;
    type: string;
    location: {
      lat: number;
      lon: number;
    };
    imageFile: string;
    quickMetrics: {
      allocation: string;
      beneficiaries: number;
      needed: number;
      timeline: string;
    };
    metrics: {
      co2Yearly: number;
      energyMWh: number;
      irr: number;
      multiplier: number;
      sroi: number;
      trees: number;
      jobs: {
        construction: number;
        ops: number;
      };
    };
    maqasid: string[];
    sgds: string[];
    verified: boolean;
    neededFund: any;
    created: any;
    currentFund: any;
    finishEstimationAt: any;
    startEstimationAt: any;
  };
}
