export abstract class HealthDbProbePort {
  abstract ping(): Promise<void>;
}

