import { Clock } from '../src';

export class MockClock implements Clock {
  private time = 0;

  now() {
    return this.time;
  }

  pass(time: number) {
    this.time += time;
  }
}
