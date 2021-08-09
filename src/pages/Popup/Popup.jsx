import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  ButtonToolbar,
  Form,
} from 'react-bootstrap';
import './Popup.scss';
import '../../assets/img/sp32.png';
import '../../assets/img/sp128.png';

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [activeTab] = await chrome.tabs.query(queryOptions);

  return activeTab;
}

function List({params, pathname, hash, handleItemChange, handlePathChange, handleHashChange, handleDeleteItem}) {
  if (!params) {
    return null;
  }

  const keyRef = React.createRef();
  const valueRef = React.createRef();

  return (<Table striped bordered hover>
    <thead>
      <tr>
      <th>Key</th>
      <th>Value</th>
      <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>path</td>
        <td colSpan="2" className="input-field"><Form.Control type='input' value={pathname} onChange={handlePathChange} /></td>
      </tr>
      <tr>
        <td>hash</td>
        <td colSpan="2" className="input-field"><Form.Control type='input' value={hash} onChange={handleHashChange} /></td>
      </tr>
      {params.map(({key, value}, index) => {
        return (<tr key={`${key}${index}`}>
          <td>{key}</td>
          <td><Form.Control value={value} onChange={(event) => handleItemChange({key, value: event.target.value, index})} /></td>
          <td><Button onClick={() => handleDeleteItem({index})}>Delete</Button></td>
        </tr>)
      })}
      <tr>
        <td><Form.Control type='input' ref={keyRef} placeholder='Add new key' /></td>
        <td><Form.Control type='input' ref={valueRef} placeholder='Add new value' /></td>
        <td><Button onClick={() => {
          const index = params.length;
          const key = keyRef.current.value;
          const value = valueRef.current.value;

          keyRef.current.value = '';
          valueRef.current.value = '';
          handleItemChange({key, value, index});
        }}>Add</Button></td>
      </tr>
    </tbody>
  </Table>);
}

async function fetchTabUrl() {
  const tab = await getCurrentTab();

  return tab.url;
}

function getParamsAndPath(url) {

  const {search, pathname, hash} = new URL(url);
  const params = [...new URLSearchParams(search).entries()].reduce((acc, [key, value]) => {
    acc.push({key, value})
    return acc;
  }, []);

  return {params, pathname, hash};
}

async function getData() {
  const url = await fetchTabUrl();

  return getParamsAndPath(url);
}

export function Popup() {
  let [pathname, setPathname] = useState('');
  let [params, setParams] = useState('');
  let [hash, setHash] = useState('');

  async function fetchData() {
    const tab = await getCurrentTab();

    if (!tab.url) {
      setParams('');
      setPathname('');
      setHash('');
      return;
    }

    const {params: newParams, pathname: newPathname, hash: newHash} = await getData();

   setParams(newParams);
   setPathname(newPathname);
   setHash(newHash);
 }
  useEffect(() => {
    fetchData();
  }, []);

  const handleValueChange = (dispatch) => (event) => {
    const {value} = event.target;

    dispatch(value);
  }

  const handleHashChange = handleValueChange(setHash);
  const handlePathChange = handleValueChange(setPathname);

  const handleItemChange = ({key, value, index}) => {
    let newParams;
    if (index === params.length) {
      newParams = [...params, {key, value}];
    } else {
      newParams = params.map((item, i) => {
        if (index === i) {
          return {key, value};
        }

        return item;
      })
    }
    setParams(newParams);
  }

  const handleDeleteItem = ({index}) => {
    const newParams = params.filter((item, i) => index !== i);

    setParams(newParams);
  }

  const handleReset = async () => {
    await fetchData();
  }

  const handleSave = async () => {
    const tab = await getCurrentTab();
    const {origin} = new URL(tab.url);
    let searchParams = params.map(({key, value}) => {
      return `${key}=${encodeURIComponent(value)}`;
    }).join('&');


    if (searchParams) {
      searchParams = `?${searchParams}`;
    }

    const newUrl = `${origin}${pathname}${searchParams}${hash}`;

    chrome.tabs.update(tab.id, {url: newUrl});
  }


  return (<div className='wrapper'>
    {!params ? <div>It seems there is not URL for modify.</div> : <List params={params} pathname={pathname} hash={hash} handlePathChange={handlePathChange} handleHashChange={handleHashChange} handleItemChange={handleItemChange} handleDeleteItem={handleDeleteItem} />}
    <ButtonToolbar>
      <Button disabled={!params} variant='secondary' className='me-3' onClick={handleReset}>Reset</Button>
      <Button disabled={!params} onClick={handleSave}>Go</Button>
    </ButtonToolbar>
  </div>);
}
