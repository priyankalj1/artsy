/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/bootstrap/initializeApp', () => ({
  initializeApp: jest.fn().mockResolvedValue({
    isAuthenticated: false,
    user: null,
  }),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

test('renders correctly', async () => {
  let tree;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
  });

  expect(tree).toBeTruthy();
});
