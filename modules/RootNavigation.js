import * as React from 'react';
import {CommonActions} from '@react-navigation/native';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function reset(name) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{name}],
    }),
  );
}
