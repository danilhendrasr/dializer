import React from 'react';
import { render } from '@testing-library/react';

import UserDashboard from '../pages/workspaces/index';

describe('Index', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserDashboard />);
    expect(baseElement).toBeTruthy();
  });
});
