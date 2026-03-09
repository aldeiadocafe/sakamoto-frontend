import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin} from 'antd'
import Title from 'antd/es/typography/Title';

import { createUnit, deleteUnit, getAllUnits, getUnitById, updateUnit } from '../../services/UnitService';

const ListUnitComponent = () => {
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [viewModal,       setViewModal]       = useState(false);
    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]     = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

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
            dataIndex:  "unidade",
            title:      "Unidade",
            sorter: (a, b) => a.unidade.localeCompare(b.unidade),
            showSorterTooltip: { target: 'sorter-icon' }, 
            ...getColumnSearchProps('unidade'),
            onFilter: (value, record) => record.unidade.indexOf(value) === 0,      
            ellipsis: true,
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
    ]

    const gravarDados = (values) => {

        const unit = {
            _id:        values._id,
            unidade:    values.unidade.toUpperCase(),
            descricao:  values.descricao.toUpperCase(),
//            descricao:form.getFieldValue('descricao') // Conteudo da tela
        };

        setConfirmLoading(true);    
        if (!isEditing) {
            createUnit(unit).then((response) => {
                message.success('Registro criado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao criar!');
                }
            });

        } else {

            updateUnit(values._id, unit).then((response) => {
                message.success('Registro atualizado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setFormModal(false)

            }).catch((error)=> {

                if (error.response) {
                    message.error(error.response.data || 'Erro no servidor');
                } else {
                    message.error('Erro ao atualizar!');
                }
            });

        }
        setConfirmLoading(false);    
   
    };

    const handleCancel = () => {        
        setFormModal(false);
        setViewModal(false);
        setDeleteModal(false);
        setIsPopupOpen(false);
        form.resetFields(); //Limpa os campos ao fechar
        carregarDados();
    };

    const carregarDados = () => {
        
        setLoading(true);
        setDados([])
        getAllUnits().then((response) => {
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
        setIsEditing(false);
        setFormModal(true);
    };

    const btnVisualizar = (value) => {
        setViewModal(true);

        if(value) {
            form.setFieldsValue({
                _id:        value._id,
                unidade:    value.unidade,
                descricao:  value.descricao
            })
        }
    }

    const btnEliminar = (value) => {

        setDeleteModal(true);

        if(value) {
            form.setFieldsValue({
                _id:        value._id,
                unidade:    value.unidade,
                descricao:  value.descricao
            })
        }
    }

    const btnEditar = (value) => {

        setIsEditing(true);

        setLoading(true);

        getUnitById(value._id).then((response) => {                        
            form.setFieldsValue({
                _id:        response.data._id,
                unidade:    response.data.unidade,
                descricao:  response.data.descricao
            });
        }).catch((error)=> {
            console.error(error);
        });

        setFormModal(true);
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {
        
        if(form.getFieldValue('_id')){
            deleteUnit(form.getFieldValue('_id')).then((response) => {
                message.success('Registro eliminado com sucesso!')
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal

            }).catch((error)=> {
                message.error('Erro ao criar!');
            });
        }
    };

    // Chamado se o usuário cancelar na Popconfirm
    const handlePopupCancel = () => {
        setIsPopupOpen(false); // Apenas fecha o Popconfirm e mantém o Modal aberto
    };

  return (
    <div>
        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Unidade de Medida</Title>
        </div>

        <Spin
//            percent={"auto"}
            spinning={loading}
            fullscreen
        />

        {/* Modal de Eliminar */}
        <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center', 
            }}>
            <Popconfirm
                title="Confirma a exclusão do registro?"
                description="Ao confirmar o registro será elimando permanentemente."
                open={isPopupOpen}
                onConfirm={handlePopupConfirm}
                onCancel={handlePopupCancel}
                okText="Sim"
                cancelText="Não"            
            />
        </div>

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
        title={ isEditing ? "Editar Unidade de Medida" : "Cadastrar Unidade de Medida"}
        open={formModal}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        onOk={() => {
            form
                .validateFields() // Validação dos campos
                .then(values => {
                    // Success: Reset fields and call the parent's onSave handler
                    gravarDados(values);
//                    form.resetFields(); 
//                    onSave(values);
                })
                .catch(info => {
                    message.info('Verificar campo(s)!');
                    // Error handling
//                    console.log('Validation Failed:', info);
                });
        }}
      >
        
        <Form
            form={form}
            layout='vertical'
//            initialValues={inicialDados} // Atribui os valores iniciais aqui
            >
            <Item
                name={"_id"}
                style={{ display: 'none'}}
            >
                <Input />
            </Item>
            <Item
                name={"unidade"}
                label="Unidade"
                rules={[{required: true, 
                         message: 'Informar Unidade de Medida'}]}
                >
                <Input 
                    placeholder='Unidade de Medida'
                    style={{ textTransform: 'uppercase' }}
                    disabled={isEditing}
                />
            </Item>
            <Item
                name={"descricao"}
                label="Descrição"
                rules={[{required: true, message: 'Informar Descrição'}]}
                >
                <Input 
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Litro'/>
            </Item>
        </Form>

      </Modal>

      {/* Modal de View */}
      <Modal
        title={ "Unidade de Medida"}
        open={viewModal}
        confirmLoading={confirmLoading}
        cancelButtonProps={{ style: { display: 'none'}}}
        onOk={() => setViewModal(false)}
        onCancel={handleCancel}        
      >
        
        <Form
            form={form}
            layout='vertical'
            >
            <Item
                name={"id"}
                style={{ display: 'none'}}
            >
                <Input />
            </Item>
            <Item
                name={"unidade"}
                label="Unidade"
                rules={[{required: true, 
                         message: 'Informar Unidade de Medida'}]}
                >
                <Input 
                    placeholder='Unidade de Medida'
                    style={{ textTransform: 'uppercase' }}
                    disabled={true}
                />
            </Item>
            <Item
                name={"descricao"}
                label="Descrição"
                rules={[{required: true, message: 'Informar Descrição'}]}
                >
                <Input 
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Litro'
                    readOnly={true}
                    />
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
                name={"id"}
                style={{ display: 'none'}}
            >
                <Input />
            </Item>
            <Item
                name={"unidade"}
                label="Unidade"
                rules={[{required: true, 
                         message: 'Informar Unidade de Medida'}]}
                >
                <Input 
                    placeholder='Unidade de Medida'
                    style={{ textTransform: 'uppercase' }}
                    disabled={true}
                />
            </Item>
            <Item
                name={"descricao"}
                label="Descrição"
                rules={[{required: true, message: 'Informar Descrição'}]}
                >
                <Input 
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Litro'
                    readOnly={true}
                    />
            </Item>
        </Form>

      </Modal>

    </div>

  )
}

export default ListUnitComponent