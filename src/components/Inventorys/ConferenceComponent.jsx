import React, { forwardRef, useState } from 'react'

import { Table, Input, Space, Button, Form, DatePicker, message, Row, Col, Card, Spin, Tooltip } from 'antd'

import { IssuesCloseOutlined, SearchOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import { useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { getPlacesInventory } from '../../services/PlacesInventoryService';

dayjs.extend(utc)

const ConferenceComponent = () => {    

    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();
    const [loading,         setLoading]         = useState(false);

    const [form]    = Form.useForm();
    const { Item }  = Form;

    const navigator = useNavigate()

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
        <div style={{ padding: 8 }}>
            <Input
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value.toUpperCase()] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
            />
            <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
            >
                Search
            </Button>
            <Button
                onClick={() => handleReset(clearFilters, confirm)}
                size="small"
                style={{ width: 90 }}
            >
                Reset
            </Button>
        </div>
        ),
        filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) => 
        record[dataIndex].toString().toUpperCase().includes(value.toUpperCase()),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Note: The actual data filtering happens internally via the 'onFilter' prop, 
        // but you can manage a state here if needed for other components.
    };
    
    const colunas = 
    [
        {
            title: 'Ação',
            key: 'action',
            width: 130,
            align: 'center',
            render: (text, record) => (
                <Space size="small">

                    <Tooltip title="Contagem">                        
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<IssuesCloseOutlined rotate={0} />}
                            onClick={() => btnContagem(record)}
                        />
                    </Tooltip>       

                </Space>
            ),
        },        
        {
            dataIndex:  "dataInventario",
            title:      "Data Inventário",
            sorter: (a, b) => new Date(a.dataInventario).getTime() - new Date(b.dataInventario).getTime(),
            // Optional: set a default sort order
            defaultSortOrder: 'descend', 
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
        },
        {
            dataIndex:  "local",
            title:      "Localização",
            sorter: (a, b) => a.local.localeCompare(b.local),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('local'),
            onFilter: (value, record) => record.local.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            dataIndex:  "situacao",
            title:      "Situação",
            sorter: (a, b) => a.situacao - b.situacao,
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
        },
    ]


    const btnPesquisar = () => {

        const local          = form.getFieldValue('local');

        let processo = '?'

        if(form.getFieldValue('dataInventario')) {

            const dataInventario = dayjs.utc(form.getFieldValue('dataInventario')).format('YYYY-MM-DD')
            processo = processo + 'dataInventario=' + dataInventario

        }

        if(local) {

            if(processo) processo = processo + '&'

            processo = processo + 'local=' + local.toString().toUpperCase()

        }

        setLoading(true);

        getPlacesInventory(processo).then((response) => {

            //Retirar Inventario Finalizado
            const dados = response.data.filter(place => place.situacao != 'FINALIZADO')

            // Ler Array
            const dadosAux = dados.map(places => ({
                _id:            places._id,
                local:          places.local,
                inventory:      places.inventory,
                dataInventario: places.inventory.dataInventario,
                situacao:       places.situacao,
            }))

            setDados(dadosAux);

        }).catch((error)=> {
            setDados([])            
            if (error.response.data.message) {
                message.error(error.response.data.message)
            } else {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao finalizar!');
                }                
            }
        });

        setTimeout(() => {
        setSelectedRowKeys([]);
        setLoading(false);
        }, 1000);    

    }

    const btnContagem = (record, rowIndex, event) => {

        navigator(`/item-conference/${record._id}`)
//        console.log('Linha clicada:', record);
//        console.log('Índice da linha:', rowIndex);
        // Você pode adicionar sua lógica aqui, como navegação ou abrir um modal
//        alert(`Você clicou na linha de: ${record._id}`);
    };

  return (
    <>
        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Conferência</Title>
        </div>

        <Spin
//            percent={"auto"}
            spinning={loading}
            fullscreen
        />

        <Card
            style={{
                marginBottom: '10px',
                borderColor: '#c36434',
                boxShadow: '0 2px 8px #d4b8ab',
                borderRadius: 8,                    
            }}
        >

            <Form
                name ='frmConferencia'
                layout='inline'
                form = {form}
            >
                <Row
                    justify={"space-between"}
                    align={"middle"}
                >

                    <Item
                        name={"_id"}
                        style={{display: 'none'}}
                    >
                        <Input />

                    </Item>
                    <Item
                        name={"dataInventario"}
                        label="Data Inventário"
                        >
                            <DatePicker 
                                placeholder='Dt Inventário'
                                style={{ width: 140 }}
                                format={{
                                    format: "DD/MM/YYYY",
                                    type: 'mask',
                                }}
                            />
                    </Item>
                    <Item
                        name={"local"}
                        label="Localização"
                        >
                        <Col
                            xs={22}
                            md={24}
                            >
                            <Input 
                                placeholder='Por exemplo: Estoque'
                                style={{ textTransform: 'uppercase' }}
                            />
                        </Col>
                    </Item>
                    <Item>
                        <Button type="primary"
                            onClick={btnPesquisar}>
                            Pesquisar
                        </Button>                    
                    </Item>

                </Row>

            </Form>

        </Card>

        <Table
            columns={colunas}
            dataSource={dados}      
            showSorterTooltip={true}
            size={'small'}
            scroll={{ y: 'calc(80vh - 90px)' }}    
            rowKey={(record) => record._id}
            pagination={{
                tabela,
                // The available options for items per page
                pageSizeOptions: ['5', '10', '20', '30'], 
                // Display the size changer
                showSizeChanger: true, 
                // Set the default page size
        //        defaultPageSize: 5,
                // Optional: show total items count
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                // Optional: update tabela page state on change
                onChange: (page) => {
                    setTabela(page);
                },
            }} 
            onRow={(record, rowIndex) => {
                return {
                onClick: (event) => {
                    btnContagem(record, rowIndex, event);
                }, // Evento de clique na linha
                // Outros eventos também podem ser adicionados aqui, como onDoubleClick, onMouseEnter, etc.
                // onDoubleClick: event => {}, 
                // onContextMenu: event => {},
                };
            }}
            // Opcional: Adiciona um cursor de mãozinha para indicar que a linha é clicável via CSS
            rowClassName="clickable-row"             
        />

    </>
  )
}

export default ConferenceComponent