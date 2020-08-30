import React from 'react';
import { render } from '@testing-library/react';
import ProjectPage from './ProjectPage';
import { MemoryRouter, Route } from 'react-router-dom';

test('renders without crashing', () => {
  const { baseElement } = render(
    <MemoryRouter initialEntries={["/project/project1"]}> 
      <Route path="/project/:name" component={ProjectPage} />
    </MemoryRouter>);
  expect(baseElement).toBeDefined();
});
