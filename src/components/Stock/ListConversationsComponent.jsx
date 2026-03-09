import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker} from 'antd'
import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createConversations, deleteConversations, getAllConversations, updateConversations } from '../../services/ConversationsItemService';

dayjs.extend(utc)

const ListConversationsComponent = () => {
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [selectUnits,     setSelectUnits]     = useState([]);

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing,       setIsEditing]       = useState(true);
    const [conversationsId, setConversationsId] = useState();
    
    const { Option, OptGroup } = Select;

    //Aplique estilos CSS para centralizar a div container na tela
    const containerPopconfirm = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Ocupa 100% da altura da viewport para centralizar verticalmente
    }

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
            title: 'Ação',
            key: 'action',
            width: 130,
            align: 'center',
            render: (text, record) => (
                <Space size="small">

                    <Tooltip title="Visualizar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EyeOutlined rotate={0} />}
                            onClick={() => btnVisualizar(record)}
                        />
                    </Tooltip>       

                    <Tooltip title="Editar">
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<EditOutlined rotate={0} />}
                            onClick={() => btnEditar(record)}
                        />
                    </Tooltip>
    {/*                <a>{record.unidade}</a>
                    <a>Delete</a>
    */}         
                    <Tooltip title="Eliminar">                        
                        <Button
                            type="primary"
                            danger
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<DeleteOutlined rotate={0} />}
                            onClick={() => btnEliminar(record)}
                        />
                    </Tooltip>       

                </Space>
            ),
        },        
        {
            title:      "Item",
            dataIndex:  "itCodigo",
            key:  "itCodigo",
            sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('itCodigo'),
            onFilter: (value, record) => record.itCodigo.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Descrição",
            dataIndex:  "descricao",
            key:        "descricao",
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            onFilter: (value, record) => record.descricao.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Unid",
            dataIndex:  "unidade",
            key:        "unidade",
            sorter: (a, b) => a.unidade.localeCompare(b.unidade),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unidade'),
            onFilter: (value, record) => record.unidade.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Código",
            dataIndex:  "codigo",
            key:        "codigo",
            sorter: (a, b) => a.codigo.localeCompare(b.codigo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('codigo'),
            onFilter: (value, record) => record.codigo.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Descrição",
            dataIndex:  "descricaoConv",
            key:        "descricaoConv",
            sorter: (a, b) => a.descricaoConv.localeCompare(b.descricaoConv),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricaoConv'),
            onFilter: (value, record) => record.descricaoConv.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "Unid",
            dataIndex:  "unidadeConv",
            key:        "unidadeConv",
            sorter: (a, b) => a.unidadeConv.localeCompare(b.unidadeConv),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unidadeConv'),
            onFilter: (value, record) => record.unidadeConv.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      "EAN",
            dataIndex:  "ean",
            key:        "ean",
            sorter: (a, b) => a.ean.localeCompare(b.ean),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('ean'),
            onFilter: (value, record) => record.ean.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            title:      'Fator', 
            dataIndex:  'fator', 
            key:        'fator',
            align: 'right',
            sorter: (a, b) => a.fator - b.fator,
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (value) => formatter.format(value),
        },
        {
            dataIndex:  "situacao",
            title:      "Situação",
            sorter: (a, b) => a.situacao.localeCompare(b.situacao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('situacao'),
            onFilter: (value, record) => record.situacao.indexOf(value) === 0,      
            ellipsis: true,
        },

    ]

    const gravarDados = (values) => {

        const conversations = {
            _id:            values._id,
            itemId:         values.itemId,
            unitId:         values.unitId,
            codigo:         values.codigo.toUpperCase(),
            descricao:      values.descricao.toUpperCase(),
            ean:            values.ean.toUpperCase(),
            fator:          values.fator,
            situacao:       values.situacao.toUpperCase()
        };

        setLoading(true);    

        if (!values._id) {

            createConversations(conversations).then((response) => {
                message.success('Registro criado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                //setFormModal(false)


            }).catch((error)=> {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        } else {

            updateConversations(values._id, conversations).then((response) => {

                message.success('Registro atualizado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setFormModal(false)

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
            
        }        
        setLoading(false);    
 
    };

    const handleCancel = () => {        
        setFormModal(false);
        setDeleteModal(false);
        form.resetFields(); //Limpa os campos ao fechar
        carregarDados();
    };

    const handleOk = async () => {

        if (isEditing) {

            try {

                const values = await form.validateFields();

                //Prossiga com a acao
                gravarDados(values);

            } catch (errorInfo) {

                message.info('Verificar campo(s)!');
            }

        } else {
            setFormModal(false)
        }
    }

    const carregarUnit = async () => {

        setLoading(true)

        await getAllUnits().then((response) => {

            // Formatar os dados
            const formatarDados = response.data.map((unit) => ({
                value: unit._id,
                label: unit.descricao
            }))

            setSelectUnits(formatarDados)

        }).catch((error) => {
            console.error(error)
        })

        setLoading(false)
        
    }

    const carregarDados = () => {
        setLoading(true);

        setDados([])
        getAllConversations().then((response) => {
            setDados(response.data);
        }).catch((error)=> {
            console.error(error);
        });

        setTimeout(() => {
        setSelectedRowKeys([]);
        setLoading(false);
        }, 1000);    

    }

    useEffect(() => {
        carregarUnit();
        carregarDados();
    },[]);


    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const showFormModal = () => {

        setIsEditing(true);
        setConversationsId();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnVisualizar = (value) => {

        setIsEditing(false)
        if(value) {

            setConversationsId(value._id)
            form.setFieldsValue({
                _id:        value._id,
                item:       value.itemId,
                unit:       value.unitId,
                codigo:     value.codigo,
                descricao:  value.descricao,
                ean:        value.ean,
                fator:      value.fator,
                situacao:   value.situacao
            })

            setFormModal(true);
                
        }
            
    }

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        if(value) {

            setConversationsId(value._id)
            form.setFieldsValue({
                _id:        value._id,
                item:       value.itemId,
                unit:       value.unitId,
                codigo:     value.codigo,
                descricao:  value.descricao,
                ean:        value.ean,
                fator:      value.fator,
                situacao:   value.situacao
            })

        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:        value._id,
                item:       value.itemId,
                unit:       value.unitId,
                codigo:     value.codigo,
                descricao:  value.descricao,
                ean:        value.ean,
                fator:      value.fator,
                situacao:   value.situacao
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){

            deleteConversations(form.getFieldValue('_id')).then((response) => {
                message.success('Registro eliminado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal

            }).catch((error)=> {
                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });
        }
    };

  return (
    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Inventário</Title>
        </div>

        <Spin
//            percent={"auto"}
            spinning={loading}
            fullscreen
        />


        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
                type='primary'
                icon={<AppstoreAddOutlined />}
                onClick={showFormModal}
                >
                    Cadastrar
            </Button>
            <br></br>
            <br></br>
        </div>
            
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
        />

      {/* Modal de Form */}
      <Modal
        title={ "Manutenção Fator de Conversão"}
        open={formModal}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}        
        onOk={handleOk}

      >        
        <Form
            form={form}
            layout='vertical'
            >
            <Item
                name={"_id"}
                style={{ display: 'none'}}
            >
                <Input />
            </Item>
            <Item
                name="dataInventario"
                label="Data Inventário"
                rules={[{required: true, 
                         message: 'Informar Data de Inventário'}]}
                >
                    <DatePicker
                        format={"DD/MM/YYYY"}
                        placeholder='Dt Inventário'
                        style={{ width: 140 }}
                        disabled={!isEditing || conversationsId}
                    />
            </Item>
            <Item
                name={"descricao"}
                label="Descrição"
                rules={[{required: true, message: 'Informar Descrição'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Inventário Loja'/>
            </Item>
            <Item
                name={"tipoInventario"}
                label="Tipo de Inventário"
                rules={[{required: true, message: 'Selecionar Tipo'}]}
                >
                <Select
                    disabled={!isEditing}
                    placeholder="Selecionar um Tipo"
                    allowClear  //Permite limpar seleção
                >
                    <Option value="TOTAL">TOTAL</Option>
                    <Option value="PARCIAL">PARCIAL</Option>
                </Select>
            </Item>
        </Form>

      </Modal>

      <Modal
        title={ "Eliminar Unidade de Medida"}
        open={deleteModal}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}        
//        onOk={() => setIsPopupOpen(true)}

        footer = {[
            <Button key="cancela" onClick={handleCancel}>
                Cancelar
            </Button>,
            <Popconfirm
                key="submit"
                title="Confirma a exclusão do registro?"
                description="Ao confirmar o registro será elimando permanentemente."
                onConfirm={handlePopupConfirm}  
                okText="Sim"
                cancelText="Não"            
                placement='topLeft'
                >
                <Button type="primary" loading={confirmLoading}>
                    OK
                </Button>
            </Popconfirm>,
        ]}

      >
        
        <Form
            form={form}
            layout='vertical'
            >
            <Item
                name={"_id"}
                style={{ display: 'none'}}
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
                        disabled={!isEditing}
                        format={{
                            format: "DD/MM/YYYY",
                            type: 'mask',
                        }}
                    />
            </Item>
            <Item
                name={"descricao"}
                label="Descrição"
                rules={[{required: true, message: 'Informar Descrição'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Estoque, Loja'/>
            </Item>
            <Item
                name={"tipoInventario"}
                label="Tipo"
                rules={[{required: true, message: 'Selecionar Tipo'}]}
                >
                <Select
                    disabled={!isEditing}
                    placeholder="Selecionar um Tipo"
                    allowClear  //Permite limpar seleção
                >
                    <Option value="TOTAL">TOTAL</Option>
                    <Option value="PARCIAL">PARCIAL</Option>
                </Select>
            </Item>
        </Form>

      </Modal>

    </div>

  )
}

export default ListConversationsComponent