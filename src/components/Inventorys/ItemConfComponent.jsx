import Title from 'antd/es/typography/Title'
import { useEffect, useRef, useState }  from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AutoComplete, Button, Grid, Card, Checkbox, Popconfirm, DatePicker, Form, Input, InputNumber, message, Row, Space, Spin, Table, Modal } from 'antd';
import { CameraOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import BarcodeScannerComponent from "react-qr-barcode-scanner";


import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'

import { getPlacesInventoryById } from '../../services/PlacesInventoryService';
import { getAllItems } from '../../services/ItemService';
import { createCountPlaces, deleteCountPlaces, getAllByPlaces } from '../../services/CountPlacesService';

dayjs.extend(utc)

const { useBreakpoint } = Grid
const { Item } = Form;

const ItemConfComponent = () => {

    const screens = useBreakpoint()

    const navigate = useNavigate();

    const {id: placesId} = useParams();

    const [itemId, setItemId] = useState('');
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [formPlaces]       = Form.useForm();
    const [formCountPlaces]  = Form.useForm();

    const [items,  setItems]    = useState([]);

    const [dadosDescricao,  setDadosDescricao]  = useState([]);
    const [valueDescricao,  setValueDescricao]  = useState('')
    const [optDescricao,    setOptDescricao]    = useState([]);    

    const [codBarra, setCodBarra ]  = useState('')
    const [stopScan, setStopScan]   = useState(false); // Estado para controlar a câmera

    const refDataValidade   = useRef(null);
    const refDescricao      = useRef(null)

    const [startDate, setStartDate] = useState();

    const [loading,         setLoading]         = useState(false);

    const [cardCount,   setCardCount]           = useState(false)

    const [isModalVisible, setIsModalVisible]   = useState(false);

    const customHeight = screens.xs ? '355px' : '230px'

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

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
            <Space>
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
            </Space>
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
            dataIndex:  "_id",
            sorter: (a, b) => a._id.localeCompare(b._id),
            // Optional: set a default sort order
            defaultSortOrder: 'descend', 

            //Ocultando coluna
            render: () => null,
            onHeaderCell: () => ({style: { display: 'none'}}),
            onCell: () => ({ style: {display: 'none'}})            
        },
        {
            title: 'Ação',
            key: 'action',
//            width: 130,
            align: 'center',
            render: (_, record) => (
                <Space size="small">

                    <Popconfirm
                        title="Deseja realmente Eliminar Contagem?"
                        description="Ao confirmar a contagem será eliminada."
                        onConfirm={() =>  btnEliminar(record)}
                        okText="Sim"
                        cancelText="Não"            
                    >
                        <Button
                            type="primary"
                            danger
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<DeleteOutlined rotate={0} />}
                        />

                    </Popconfirm>
                </Space>
            ),
        },        
        {
            dataIndex:  "descricao",
            title:      "Item",
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            onFilter: (value, record) => record.local.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            dataIndex:  "dataValidade",
            title:      "Dt Validade",
            sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            ellipsis: true,
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),

        },
        {
            dataIndex:  "quantidade",
            title:      "Quantidade",
            align: 'right',
            render: (value) => formatter.format(value)
        }
    ]

    //Mostra todas as opções quando o campo é focado
    const onFocusDescricao = () => {
        setOptDescricao(dadosDescricao)
    }

    // onSearch é acionado quando o usuário digita no input
    const onSearchDescricao = (value) => {

        let res = []
        if (!value) {
            res = []
        } else {

            res = items
                .filter((item) =>
                    item.descricao.toUpperCase().includes(value.toUpperCase())
                )
                .map((item) => ({
                    // 'value' é o que preenche o input quando selecionado
                    value: item.descricao, 
                    // 'label' é o que aparece no dropdown
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.descricao}</span>
                        </div>
                    ),
                    _idItem:    item?._id,
                    itCodigo:   item?.itCodigo,
                    unit:       item?.unit,
                    unidade:    item?.unit?.unidade,
                    // Guardamos o id original na opção para uso no onSelect
                    dataId: item?._id, 
            }));
                
        }
        setOptDescricao(res)

    };

    // onSelect é acionado quando o usuário seleciona uma opção do dropdown
    const onSelectDescricao = (value, option) => {

        setItemId(option.id)

        //Atribuir valores para os campos invisiveis
        formCountPlaces.setFieldsValue({
            _idItem:    option._idItem,
            itCodigo:   option.itCodigo,
            unidade:    option.unidade
        })

        if (option._idItem) {
            focusDataValidade()
        }

    }

    /*  Focus no campo */
    const focusDataValidade = () => {
        refDataValidade.current?.focus();
    }
    
    const focusDescricao = () => {
        refDescricao.current?.focus();
    }

    //Gravar
    const onFinishFormItems = async (values) => {

        setLoading(true);

        const countPlaces = {
            placesInventory:    placesId,   
            item:               values._idItem,
            dataValidade:       dayjs.utc(values.dataValidade),
            quantidade:         values.quantidade
        };

        await createCountPlaces(countPlaces).then((response) => {
            
            message.success('Registro criado com sucesso!')

            carregarCount()

            if(!formCountPlaces.getFieldValue('chDescricao')) {
                formCountPlaces.resetFields(['descricao', 'unidade'])
            }

            if(!formCountPlaces.getFieldValue('chDataValidade')) {
                formCountPlaces.resetFields(['dataValidade'])
            }

            formCountPlaces.resetFields(['quantidade'])

        }).catch((error)=> {
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

        setLoading(false);

    }

    const onFinishFailedFormItems = (errorInfo) => {
        // Esta função será chamada se a submissão falhar devido a erros de validação.
        console.log('Falha na validação:', errorInfo);
    };

    const handleVoltar = () => {
        navigate('/conferences')
    }

    const btnEliminar = (value) => {

        setLoading(true)
        if (value) {

            deleteCountPlaces(value._id).then((response) => {
                message.success('Registro eliminado com sucesso!')
                carregarCount()
            }).catch((error)=> {
                if (error.response.data.message) {
                    message.error(error.response.data.message)
                } else {
                    if (error.response) {
                        message.error(error.response.data || 'Erro no servidor');
                    } else {
                        message.error('Erro ao eliminar!');
                    }                
                }
            });

        }

    }

    const carregarCount = async() => {

        setLoading(true);     
        setDados([])   
        getAllByPlaces(placesId).then((response) => {

            const dados = response.data.map((count) => ({
                _id:            count._id,
                descricao:      count.item.descricao,
                dataValidade:   dayjs.utc(count.dataValidade),
                quantidade:     count.quantidade
            }))

            setDados(dados);

        }).catch((error)=> {
            console.error(error);
        });

        setTimeout(() => {
        setSelectedRowKeys([]);
        setLoading(false);
        }, 1000);    

    }

    const onClickCamera = () => {

        setCodBarra([])
        setIsModalVisible(true)

    }

    const handleCancel = async () => {             
        setIsModalVisible(false);
    };

    const handleScan = (err, result) => {

        if (result) {
            setIsModalVisible(false);
            setCodBarra(result.text)

        }

    }

    const handleCloseModal = () => {
        if (codBarra.length > 0) {

            formCountPlaces.setFieldsValue({
                descricao: 'COCA COLA',          // Atribuir o valor do campo VALUE
                unidade: 'UN'
            })
            focusDataValidade()

        } else {
            focusDescricao()
        }

    }

    const validateDataValidade = (_, value) => {

        if (!value) return Promise.resolve(); // Permite que a validação de campo obrigatório trate a ausência de valor

        return new Promise((resolve, reject) => {

            //Verifica se a data é anterio a hoje
            if (value.isBefore(dayjs().startOf('day'))) {
    //            return Promise.reject(new Error('A data não pode ser anterior a hoje!'));
                Modal.confirm(
                    {
                        title: 'Data de Validade Vencida',
                        content: 'A data de validade informada é anterior a hoje. Deseja continuar?',
                        onOk: () => { resolve()},
                        onCancel: () => {
                            reject();
//                            formCountPlaces.resetFields(['dataValidade'])
                        }
                    })

            } else {
                resolve();
            }


        })

    }

    useEffect(() => {

        if(placesId){

            setLoading(true);

            getPlacesInventoryById(placesId).then((response) => {

                const dados = response.data

                formPlaces.setFieldsValue({
                    dataInventario: dayjs.utc(dados.inventory.dataInventario).format('DD/MM/YYYY') + ' - ' + dados.inventory.descricao,
                    local:          dados.local
                })                                   

                //Carregar Items
                getAllItems().then((response) => {

                    const dados = response.data
                                    .filter( item => item.situacao === 'ATIVO')
                                    .map(item => {

                            return {
                                _idItem:    item._id,
                                itCodigo:   item.itCodigo,
                                unit:       item.unit,
                                unidade:    item.unit?.unidade,
                                value:      item.descricao,
                                label:      item.descricao
                            }
                    })

                    setDadosDescricao(dados)
                    setOptDescricao(dados)
                    setItems(response.data)

                }).catch((error)=> {
                    console.error(error);
                });
                             
                carregarCount()

                setLoading(false);

            }).catch((error)=> {
                console.error(error);
            });

        }

    }, []);    

  return (
    <>        
        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Conferência do Item</Title>
        </div>

        <Spin
//            percent={"auto"}
            spinning={loading}
            fullscreen
        />

        {/* Card de Inventário */}
        <Card
            size='small'
            style={{
                marginBottom: '10px',
                borderColor: '#c36434',
                boxShadow: '0 2px 8px #d4b8ab',
                borderRadius: 8,                    
            }}
        >

            <Form 
                form={formPlaces}
                layout="inline"
                size='small'
                style={{ display: 'flex', 
                         justifyContent: 'center', alignItems: 'center' }}
                >

                <Row>
                    <Item
                        name={"dataInventario"}
                        label="Inventário"                    
                        style={{ marginRight: '60px'}}
                    >
                        <Input 
                            readOnly={true}
                            size='small'
                            />
                    </Item>
                </Row>
                <Item
                    name={"local"}
                    label="Local"                    
                >
                    <Input 
                        readOnly={true}
                        size='small'
                        />
                </Item>

            </Form>

        </Card>

        {/* Card Item Inventário */}
        <Card
            size='small'
            style={{
                marginBottom: '10px',
                borderColor: '#c36434',
                boxShadow: '0 2px 8px #d4b8ab',
                borderRadius: 8,
                padding: '0px',
                height: customHeight,
//                height: '310px'
//                height: 'calc(50vh)' 
                transition: 'customHeight 0.3s ease' // 3. Adicionar transição suave

            }}
        >
            <Button
                onClick={onClickCamera}
                icon={<CameraOutlined />}
                size="small"
                shape="circle"
            />

            <Form
                form={formCountPlaces}
                layout='horizontal'
                size='small'
                onFinish={onFinishFormItems}
//                onFinishFailed={onFinishFailedFormItems}
            >
                <Item
                    name={"_id"}
                    style={{display: 'none'}}
                >
                    <Input />
                </Item>
                <Item
                    name={"_idItem"}
                    style={{display: 'none'}}
                >
                    <Input />
                </Item>
                <Item
                    name={"itCodigo"}
                    style={{display: 'none'}}
                >
                    <Input />
                </Item>

                <Row>
                    <Space>
                        <Item
                            name="chDescricao"
                            valuePropName="checked"
                        >
                            <Checkbox/>                        
                        </Item>
                        <Item
                            name = "descricao"
                            label="Descrição"
                            required
                            rules={[{required: true, 
                                    message: 'Informar Descrição do Item'}]}
                        >
                            <AutoComplete
                                allowClear      // Enable the clear button
//                                value={valueDescricao}    // Controlled component value
                                options={optDescricao}   // // O array de sugestões {value, label}
                                onSelect={onSelectDescricao}
                                onSearch={onSearchDescricao}
                                onFocus={onFocusDescricao}
                                ref={refDescricao}
//                                onChange={onChangeDescricao}
                                //onBlur={onBlurDescricao}     // Leave do campo

                                // --- Props de Comportamento ---
                                style={{ minWidth: 260}}
                                placeholder="Descrição do Item"
//                                allowClear // Mostra ícone para limpar o input
//                                filterOption={false} // Desabilita filtro automático (filtramos no handleSearch)

                                // --- Customização ---
                                notFoundContent="Nenhum resultado encontrado"
                            >
                            </AutoComplete>                        

                        </Item>

                        <Item
                            name = "unidade"
                            label="UN"
                        >
                            <Input 
//                                readOnly={true}
                                disabled 
                                size='small'
                                style={{ width: 40 }}
                                />
                            
                        </Item>
                    </Space>
                </Row>
                <Row>
                    <Space>
                        <Item
                            name="chDataValidade"
                            valuePropName="checked"
                        >
                            <Checkbox/>                        
                        </Item>
                        <Item
                            name={"dataValidade"}
                            label="Dt Validade"
                            required
                            validateTrigger={['onBluir']}
                            rules={[{required: true, 
                                    message: 'Informar Data de Validade'},
                                    {validator: validateDataValidade}
                                    ]}
                            
                            >
                                <DatePicker 
                                    placeholder='Dt Validade'
                                    selected={startDate}
                                    ref={refDataValidade}
                                    style={{ width: 140 }}
                                    format={{
                                        format: "DD/MM/YYYY",
                                        type: 'mask',
                                    }}
                                />
                        </Item>
                    </Space>
                </Row>
                <Item
                    name={"quantidade"}
                    label="Quantidade"
                    required
                    rules={[
                        {required: true},
                        {
                            validator: (_, value) => 
                                value > 0 
                                ? Promise.resolve()
                                : Promise.reject(new Error('A quantidade deve ser maior que zero')),                                    
                        }
                        ]}
                >
                    <InputNumber
                        style={{ width: 140 }}
                        step={1}
                        decimalSeparator=','
                    >
                    </InputNumber>

                </Item>

                <Item>
                    <Space>
                        <Button onClick={handleVoltar}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Gravar
                        </Button>
                        <Checkbox
                            onChange={()=> {setCardCount(!cardCount)}}
                        >
                            Exibir Contagem
                        </Checkbox>
                    </Space>
                </Item>
                <Item>
                </Item>
            </Form>

        </Card>

        {cardCount && (
            <Card
                title="Contagem"
                style={{
                    marginBottom: '10px',
                    borderColor: '#c36434',
                    boxShadow: '0 2px 8px #d4b8ab',
                    borderRadius: 8,                    
                    height: 'calc(100% - 315px)' 
                }}
            >

                <Table
                    columns={colunas}
                    dataSource={dados}      
                    showSorterTooltip={true}
                    size={'small'}
                    scroll={{ y: 'calc(80vh - 370px)' }}                
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
                />
            </Card>
        )}

        {/* Código de Barra */}
        <Modal
            open={isModalVisible}
            onCancel={handleCancel}
            afterClose={handleCloseModal}
            destroyOnHidden={true}
            footer={null}
            centered    // Centraliza o modal
        >

            <div>
                <Title level={3}
                    style={{ color: 'var(--primary-color)'}}
                >Ler Código de Barra / QR Code</Title>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >

                {isModalVisible && (
                    <BarcodeScannerComponent
                        alignItems="center"
                        width={300}
                        height={300}
                        stopStream={stopScan}   // Passa o estado para a prop
                        onUpdate={handleScan}
                    />
                )}                    
            </div>

        </Modal>

    </>
  )
}

export default ItemConfComponent
