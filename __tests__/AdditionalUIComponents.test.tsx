import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';

describe('Additional UI Components', () => {
  describe('Textarea', () => {
    it('should render textarea', () => {
      const { container } = render(<Textarea placeholder="Enter text" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder', 'Enter text');
    });

    it('should handle disabled state', () => {
      const { container } = render(<Textarea disabled />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeDisabled();
    });

    it('should apply custom className', () => {
      const { container } = render(<Textarea className="custom-class" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('custom-class');
    });
  });

  describe('Table Components', () => {
    it('should render table structure', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelector('th')).toHaveTextContent('Header');
      expect(container.querySelector('td')).toHaveTextContent('Cell');
    });

    it('should apply custom className to table', () => {
      const { container } = render(<Table className="custom-table" />);
      expect(container.querySelector('table')).toHaveClass('custom-table');
    });

    it('should render multiple rows', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow><TableCell>Row 1</TableCell></TableRow>
            <TableRow><TableCell>Row 2</TableCell></TableRow>
            <TableRow><TableCell>Row 3</TableCell></TableRow>
          </TableBody>
        </Table>
      );
      
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(3);
    });
  });

  describe('Select Components', () => {
    it('should render select trigger', () => {
      const { getByRole } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      
      expect(getByRole('combobox')).toBeInTheDocument();
    });

    it('should render select with items', () => {
      const { getByRole } = render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      
      expect(getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle disabled select', () => {
      const { getByRole } = render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      );
      
      expect(getByRole('combobox')).toBeDisabled();
    });
  });
});
