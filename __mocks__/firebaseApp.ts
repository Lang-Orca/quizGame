interface MockApp {
  name: string;
}

const app: MockApp = {name: '[DEFAULT]'};

export function getApp(): MockApp {
  return app;
}

export function getApps(): MockApp[] {
  return [app];
}

export default getApp;
