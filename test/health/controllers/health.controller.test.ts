import { HealthController } from 'src/health/controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return { status: "ok" }', () => {
      expect(controller.healthCheck()).toEqual({ status: 'ok' });
    });
  });
});
