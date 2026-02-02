import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAppState } from '@/hooks/useAppState';

export interface ParentComponentProps {
  children: React.ReactNode;
}
const ParentComponent: React.FC<ParentComponentProps> = ({ children }) => {
  useAppState()
  return (
    <>
      {children}
    </>
  );
};

export default ParentComponent;