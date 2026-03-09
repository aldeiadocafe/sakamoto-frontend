import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker} from 'antd'
import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createInventory, deleteInventory, endInventory, getAllInventorys, updateInventory } from '../services/InventoryService';

dayjs.extend(utc)

const ListInventoryComponent = () => {
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]                 = useState(true);
    const [idInventory, setIdInventory]             = useState();
    
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
            dataIndex:  "descricao",
            title:      "Descrição",
            sorter: (a, b) => a.descricao.localeCompare(b.descricao),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('descricao'),
            onFilter: (value, record) => record.descricao.indexOf(value) === 0,      
            ellipsis: true,
        },
        {
            dataIndex:  "tipoInventario",
            title:      "Tipo",
            sorter: (a, b) => a.tipo.localeCompare(b.tipo),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('tipo'),
            onFilter: (value, record) => record.local.indexOf(value) === 0,      
            ellipsis: true,
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
        {
            title: 'Finalizar',
            key: 'finalizar',
            width: 130,
            align: 'center',
            render: (_, record) => (
                <Space size="small">

                    <Popconfirm
                        title="Deseja realmente Finalizar o Inventário?"
                        description="Ao confirmar o inventário será considerado como FINALIZADO, não sendo possível reabrir."
                        onConfirm={() =>  handlePopupConfirmFinaliz(record)}
                        okText="Sim"
                        cancelText="Não"            
                    >
                        <Button
                            type="primary"
                            shape='circle'
                            className={'rotate-icon'}
                            icon={<CheckSquareOutlined rotate={0} />}
                            disabled = {record.tipoInventario === 'FINALIZADO'}
                        />
                    </Popconfirm>                    
                </Space>
            ),
        },        
    ]

    const gravarDados = (values) => {

        const inventory = {
            _id:            values._id,
            dataInventario: dayjs.utc(values.dataInventario),
            descricao:      values.descricao.toUpperCase(),
            tipoInventario: values.tipoInventario.toUpperCase(),
            situacao:       values._id ? values.situacao.toUpperCase() : 'CRIADO',

        };

        setLoading(true);    

        if (!values._id) {

            createInventory(inventory).then((response) => {
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

            updateInventory(values._id, inventory).then((response) => {

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

    const carregarDados = () => {
        setLoading(true);

        setDados([])
        getAllInventorys().then((response) => {
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
        carregarDados();
    },[]);


    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const showFormModal = () => {

        setIsEditing(true);
        setIdInventory();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnVisualizar = (value) => {

        setIsEditing(false)
        if(value) {

            setIdInventory(value._id)
            form.setFieldsValue({
                _id:            value._id,
                dataInventario: dayjs.utc(value.dataInventario),
                descricao:      value.descricao,
                tipoInventario: value.tipoInventario,
                situacao:       value.situacao
            })

            setFormModal(true);
                
        }
            
    }

    const btnFinalizar = async (value) => {

        setIsPopupFinalizar(true)
/*        
        setLoading(true);    
        await endInventory(value._id).then((response) => {
            message.success('Inventário Finalizado')
            setIsPopupFinalizar(true)            
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
*/
    }

    const btnEditar = (value) => {

        setIsEditing(true);
        setFormModal(true);

        if(value) {

            setIdInventory(value._id)
            form.setFieldsValue({
                _id:            value._id,
                dataInventario: dayjs.utc(value.dataInventario),
                descricao:      value.descricao,
                tipoInventario: value.tipoInventario,
                situacao:       value.situacao
            })

        }

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:            value._id,
                dataInventario: dayjs.utc(value.dataInventario),
                descricao:      value.descricao,
                tipoInventario: value.tipoInventario,
                situacao:       value.situacao
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){

            deleteInventory(form.getFieldValue('_id')).then((response) => {
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

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirmFinaliz = (value) => {

        setLoading(true);    

        if(value){

            endInventory(value._id).then((response) => {

                message.success('Registro finalizado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();

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
            
        }

        setLoading(false);
        
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
        title={ "Manutenção Cadastro Inventário"}
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
                        disabled={!isEditing || idInventory}
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

export default ListInventoryComponent