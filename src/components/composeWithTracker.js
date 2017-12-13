import Trackr from 'trackr';
import { compose } from 'react-komposer';

import Data from '../Data';
import _ from 'underscore';

export default function(reactiveFn, collections = [], L, E, options) {
  const onPropsChange = (props, onData) => {
    let trackerCleanup;
    const _meteorDataDep = new Trackr.Dependency();
    const _meteorDataChangedCallback = (msg)=>{
      if (typeof msg === 'object' && collections.length > 0) {
        const dbChanged = Object.keys(msg);
        const intersection = _.intersection(dbChanged, collections);
        if (intersection.length > 0 ){
          _meteorDataDep.changed();        
        }
      } else if (collections.length === 0) {
        _meteorDataDep.changed();        
      }
    };

    Data.onChange(_meteorDataChangedCallback);

    const handler = Trackr.nonreactive(() => {
      return Trackr.autorun(() => {
        _meteorDataDep.depend();
        trackerCleanup = reactiveFn(props, onData);
      });
    });

    return () => {
      if (typeof (trackerCleanup) === 'function') {
        trackerCleanup();
      }
      Data.offChange(_meteorDataChangedCallback);
      return handler.stop();
    };
  };

  return compose(onPropsChange, L, E, options);
}