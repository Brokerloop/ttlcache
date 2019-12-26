import { SpyOn } from 'alsatian';
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

export const makeSpy = <T>() => {
  const spy = { on(_arg: T) { /**/ } };
  SpyOn(spy, 'on');

  return spy;
};
