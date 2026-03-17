import { useState } from 'react';

import { Button, Layout} from 'antd';

import Logo from './components/Logo';
import MenuList from './components/MenuList';
import { Content } from 'antd/es/layout/layout';
import ListUnitComponent from './components/Stock/ListUnitComponent';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IndexComponent from './components/IndexComponent';
import ListItemComponent from './components/Stock/ListItemComponent';
import ConferenceComponent from './components/Inventorys/ConferenceComponent';
import ItemConfComponent from './components/Inventorys/ItemConfComponent';
import ListInventoryComponent from './components/Inventorys/ListInventoryComponent';
import ListPlacesInventoryComponent from './components/Inventorys/ListPlacesInventoryComponent';
import ListDatesItemBalanceComponent from './components/Stock/ListDatesItemBalanceComponent';


import { DatePicker, ConfigProvider } from 'antd'

// 1. Importar o locale do Antd
import ptBR from 'antd/locale/pt_BR';

// 2. Importar o locale do Day.js
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';
import ListStockBalanceComponent from './components/Stock/ListStockBalanceComponent';
import ImportInvoicesComponent from './components/Receipts/ImportInvoicesComponent';
import ImportEstoqueGComComponent from './components/GComs/ImportGComComponent';
import ListConversationsComponent from './components/Stock/ListConversationsComponent';

// 3. Definir o locale do dayjs globalmente
dayjs.locale('pt-br');

const { RangePicker } = DatePicker

const { Header, Sider} = Layout;

function App() {

  const [collapsed, setCollapsed] = useState(true);

  return (

    <>
      
      <ConfigProvider locale={ptBR}>
      
        <BrowserRouter>      
          <Layout className="full-height-layout">
            <Sider 
              width={220}
              collapsedWidth='40px'
              collapsed={collapsed} 
              collapsible
              trigger={null}
              onMouseLeave={() => setCollapsed(true)}
              onMouseEnter={() => setCollapsed(false)}
              style={{ background: 'var(--primary-color)' /* Sua cor personalizada */ }}
              >
              <a href='/'>
                <div className='sider-logo'>
                  <Button
                    type='text'
                    className='toogle'
                    width='100%'
                    onClick={() => setCollapsed(!collapsed)}
                    >
                      <Logo/>
                    </Button>
                </div>
              </a>
              <MenuList/>
            </Sider>
            <Content
                style={{
                  padding: '10px',
                  height: '100vh',
                  }}
              >
                <Routes>

                  {/* http://localhost:5173/ */}
                  <Route path='/'         element={<IndexComponent/>}/>

                  {/* http://localhost:5173/units */}
                  <Route path='/units'    element={<ListUnitComponent/>}/>

                  {/* http://localhost:5173/units */}
                  <Route path='/items'    element={<ListItemComponent/>}/>

                  {/* http://localhost:5173/conversationsitem */}
                  <Route path='/conversationsitem'    element={<ListConversationsComponent/>}/>

                  {/* http://localhost:5173/gcom */}
                  <Route path='/estoquegcom'    element={<ImportEstoqueGComComponent/>}/>

                  {/* http://localhost:5173/stockbalance */}
                  <Route path='/stockbalance' element={<ListStockBalanceComponent/>} />

                  {/* http://localhost:5173/datesitemsbalance */}
                  <Route path='/datesitemsbalance' element={<ListDatesItemBalanceComponent/>} />

                  {/* http://localhost:5173/inventorys */}
                  <Route path='/inventorys'    element={<ListInventoryComponent />}/>

                  {/* http://localhost:5173/placesinventory */}
                  <Route path='/placesinventory'    element={<ListPlacesInventoryComponent />}/>

                  {/* http://localhost:5173/conferences */}
                  <Route path='/conferences'    element={<ConferenceComponent/>}/>

                  {/* http://localhost:5173/item-conference */}
                  <Route path='/item-conference/:id'    element={<ItemConfComponent/>}/>

                  {/* http://localhost:5173/invoices */}
                  <Route path='/importarnfe'    element={<ImportInvoicesComponent />}/>

                </Routes>

            </Content>
          </Layout>
        </BrowserRouter>

      </ConfigProvider>
      
    </>
  )
}

export default App
