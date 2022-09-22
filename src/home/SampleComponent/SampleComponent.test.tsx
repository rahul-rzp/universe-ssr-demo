import React from 'react';
import { render, screen } from '@testing-library/react';
import SampleComponent from './SampleComponent';

describe('SampleComponent', () => {
  test('loads and displays message', () => {
    render(<SampleComponent />);
    expect(screen.getByText('This is a sample component')).toBeDefined();
  });
});
