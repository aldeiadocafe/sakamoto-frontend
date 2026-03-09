import { useState } from 'react';
import { AppstoreAddOutlined, AppstoreOutlined, BookOutlined, CalculatorOutlined, FunnelPlotOutlined, HistoryOutlined, HomeOutlined, ScheduleOutlined, SettingOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';

import { Menu, ConfigProvider } from 'antd';
import { Link } from 'react-router-dom';
import { BiBadgeCheck, BiBox, BiUnite } from 'react-icons/bi';
import { BsArrowLeftRight, BsBoxSeam, BsCashStack, BsCurrencyDollar, BsReceiptCutoff } from 'react-icons/bs';

const MenuList = () => {

    const [current, setCurrent] = useState('1');

    const menuItems = [
        { 
            key: 'estoque',
            icon: <AppstoreOutlined />,
            label: "Estoque",
            children: [
                {
                    key:'estoqueCadastro',
                    label: 'Cadastro',
                    children: [
                        {
                            key: 'unidade',
//                            icon: <FunnelPlotOutlined />,
                            icon: <BiUnite/>,
                            label: 
                                <Link to="/units">
                                    Unid Medida
                                </Link>,

                        },
                        {
                            key: 'item',
                            icon: <AppstoreAddOutlined />,
                            label: 
                                <Link to="/items">
                                    Item
                                </Link>,
                        },
                        {
                            key: 'fatorConversao',
                            icon: <BsArrowLeftRight />,
                            label: 
                                <Link to="/conversationsitem">
                                    Fator Conv
                                </Link>,
                        },
                    ]
                },
                {
                    key: 'estoqueConsulta',
                    label: 'Consulta',
                    children: [
                        {
                            key: 'stockBalance',
//                            icon: <FunnelPlotOutlined />,
                            icon: <BiBox/>,
                            label: 
                                <Link to="/stockbalance">
                                    Saldo Item
                                </Link>,

                        },
                        {
                            key: 'datesItemsBalance',
                            icon: <FunnelPlotOutlined />,
                            label: 
                                <Link to="/datesitemsbalance">
                                    Data Validade
                                </Link>,

                        },
                    ]
                },
            ] 
        },
        { 
            key: 'mnuInventario',
            icon: <ScheduleOutlined />,
            label: "Inventário",
            children: [
                {
                    key: 'inventario',
                    icon: <HistoryOutlined />,
                    label: 
                        <Link to="/inventorys">
                            Inventário
                        </Link>,

                },                
                {
                    key: 'placesInventory',
                    icon: <BookOutlined />,
                    label: 
                        <Link to="/placesinventory">
                            Local
                        </Link>,

                },                
                {
                    key: 'conferencia',
                    icon: <CalculatorOutlined />,
                    label: 
                        <Link to="/conferences">
                            Conferência
                        </Link>,

                },
            ]
        },
        { 
            key: 'gcom',
            icon: <BsCashStack/>,
            label: "GCom",
            children: [
                {
                    key: 'estoqueGCom',
                    icon: <BsBoxSeam/>,
                    label: 
                        <Link to="/estoquegcom">
                            Atualizar Estoque
                        </Link>,

                },
            ]
        },
        { 
            key: 'mnuReceipt',
            icon: <BiBox />,
            label: "Recebimento",
            children: [
                {
                    key: 'mnuImportarNFe',
                    icon: <BsReceiptCutoff />,
                    label: 
                        <Link to="/importarnfe">
                            Importar NFe
                        </Link>,
                },
            ]
        },
        { 
            key: 'sistema',
            icon: <SettingOutlined />,
            label: "Configuração",
            children: [
                {
                    key: 'usuario',
                    icon: <UserOutlined />,
                    label: "Usuário"
                }
            ]
        },
    ];

    const onClick = (e) => {
        setCurrent(e.key);
    }

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // Cor do texto para itens de menu padrão
            itemColor: '#464545ff', // Exemplo: Verde
            // Cor do texto para o item de menu selecionado
            itemSelectedColor: 'var(--error-color)', // Exemplo: Vermelho
            // Cor de fundo do item selecionado, se necessário
            // itemSelectedBg: '#f0f0f0',
          },
        },
      }}
    >
        <Menu 
            theme="light" 
            mode='inline' 
            className='menu-bar'
            items={menuItems}
            onClick={onClick}
            selectedKeys={[current]}>
        </Menu>
        
    </ConfigProvider>
  )
}

export default MenuList