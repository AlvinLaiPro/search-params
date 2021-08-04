import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  Row,
  Table,
  ButtonToolbar,
  ButtonGroup,
} from 'react-bootstrap';
import './Popup.scss';
import '../../assets/img/sp32.png';
import '../../assets/img/sp128.png';

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [activeTab] = await chrome.tabs.query(queryOptions);

  return activeTab;
}
export async function Popup() {
  const tab = await getCurrentTab();
  console.log('debug ~ file: Popup.jsx ~ line 21 ~ Popup ~ tab.url', tab.url);
  const {search, pathname} = new URL(tab.url);

  if (search) {
    const params = new URLSearchParams(search);
    const searchParams = search;
    const originPathName = pathname;
  }

  return <Container />;
}
