// React router implmentation to allow history for deployed application
import { createMemoryHistory, createBrowserHistory } from 'history';

const history =
  process.env.NODE_ENV === 'test'
    ? createMemoryHistory()
    : createBrowserHistory();

export default history;
