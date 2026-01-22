import { api, initializeAPI } from '@/lib/api';

// Initialize on first request
let initialized = false;

export const GET = async (request: Request) => {
  if (!initialized) {
    await initializeAPI();
    initialized = true;
  }
  return api.handle(request);
};

export const POST = async (request: Request) => {
  if (!initialized) {
    await initializeAPI();
    initialized = true;
  }
  return api.handle(request);
};

export const PUT = async (request: Request) => {
  if (!initialized) {
    await initializeAPI();
    initialized = true;
  }
  return api.handle(request);
};

export const PATCH = async (request: Request) => {
  if (!initialized) {
    await initializeAPI();
    initialized = true;
  }
  return api.handle(request);
};

export const DELETE = async (request: Request) => {
  if (!initialized) {
    await initializeAPI();
    initialized = true;
  }
  return api.handle(request);
};
