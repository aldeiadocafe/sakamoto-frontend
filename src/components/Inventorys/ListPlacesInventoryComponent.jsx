import { useEffect, useState } from 'react'
import { AppstoreAddOutlined, CheckSquareOutlined, DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Table, Input, Button, Space, Modal, Form, message, Tooltip, Popconfirm, Spin, Select, DatePicker} from 'antd'

import { createPlacesInventory, deletePlacesInventory, endPlaces, getAllPlacesInventory, updatePlacesInventory } from '../../services/PlacesInventoryService';

import Title from 'antd/es/typography/Title';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { getAllInventorys } from '../../services/InventoryService';

dayjs.extend(utc)

const ListPlacesInventoryComponent = () => {
    
    const [tabela,          setTabela]          = useState(1);
    const [dados,           setDados]           = useState([]);
    const [selectInventory, setSelectInventory] = useState([]);
    const [searchText,      setSearchText]      = useState('');
    const [SelectedRowKeys, setSelectedRowKeys] = useState();

    const [deleteModal,     setDeleteModal]     = useState(false);
    const [formModal,       setFormModal]       = useState(false);
    const [confirmLoading,  setConfirmLoading]  = useState(false);
    const [loading,         setLoading]         = useState(false);
    
    const [form]    = Form.useForm();
    const { Item }  = Form;

    const [isEditing, setIsEditing]                 = useState(true);
    const [idPlacesInventory, setIdPlacesInventory] = useState();
    
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
                        title="Deseja realmente Finalizar Localização?"
                        description="Ao confirmar a localização será considerado como FINALIZADO, não sendo possível reabrir."
                        onConfirm={() =>  btnFinalizar(record)}
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

        const placesinventory = {
            _id:                values._id,  
            inventory:          values.inventory,         
            local:              values.local.toUpperCase(),
            situacao:           values._id ? values.situacao.toUpperCase() : 'CRIADO',
            placesinventory:    values.placesinventory
        };

        setLoading(true);    

        if (!values._id) {

            createPlacesInventory(placesinventory).then((response) => {
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

            updatePlacesInventory(values._id, placesinventory).then((response) => {

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

    const carregarDados = async () => {

        setLoading(true);      

        setDados([]);

        await getAllPlacesInventory().then((response) => {

            // EXIBIR OS LOCAIS COM SITUACAO DIFERENTES DE FINALIZADO
            const dados = response.data.filter(places => 
                places.situacao != 'FINALIZADO'
            )

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
            console.error(error);
        });

        setLoading(false);

    }

    const carregarSelectInventario = async () => {

        setLoading(true)
        await getAllInventorys().then((response) => {

            // EXIBIR OS LOCAIS COM SITUACAO DIFERENTES DE FINALIZADO
            const dados = response.data.filter(inventory => 
                inventory.situacao != 'FINALIZADO'
            )

            // Formatar os dados
            const formatarDados = dados.map((inventario) => ({
                value: inventario._id,
                label: dayjs.utc(inventario.dataInventario).format('DD/MM/YYYY') + ' - ' + inventario.descricao
            }))

            setSelectInventory(formatarDados)

        }).catch((error) => {
            console.error(error)
        })

        setLoading(false)
        
    }

    useEffect(() => {
        carregarDados();
        carregarSelectInventario()
    },[]);

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText({});
        confirm();
    };

    const showFormModal = () => {

        setIsEditing(true);
        setIdPlacesInventory();
        if(form) {
            form.resetFields(); //Limpa os campos ao fechar
        }

        setFormModal(true);
    };

    const btnFinalizar = async (value) => {

        setLoading(true);    
        await endPlaces(value._id).then((response) => {
            message.success('Localização Finalizada')
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
        
        setLoading(false);    

    }

    const btnEliminar = (value) => {

        setIsEditing(false)
        setDeleteModal(true);

        if(value) {

            form.setFieldsValue({
                _id:            value._id,
                inventory:      value.inventory._id,
                local:          value.local,
                situacao:       value.situacao
            })
        }
    }

    // Chamado se o usuário confirmar na Popconfirm
    const handlePopupConfirm = () => {

        if(form.getFieldValue('_id')){
            deletePlacesInventory(form.getFieldValue('_id')).then((response) => {
                form.resetFields(); //Limpa os campos ao fechar
                carregarDados();
                setDeleteModal(false); // Fecha o Modal principal
                message.success('Registro eliminado com sucesso!')

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
            >Local de Inventário</Title>
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
        title={ "Manutenção Localização de Inventário"}
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
                name="inventory"
                label="Data Inventário"
                rules={[{required: true, 
                         message: 'Informar Data de Inventário'}]}
                >
                <Select
                    disabled={!isEditing || idPlacesInventory}
                    placeholder="Selecionar Data de Inventário"
                    allowClear  //Permite limpar seleção
                    loading={loading}   // Mostrar ícone de carregamento
                    options={selectInventory}
                >
                </Select>
            </Item>
            <Item
                name={"local"}
                label="Localização"
                rules={[{required: true, message: 'Informar Localização'}]}
                >
                <Input 
                    disabled={!isEditing || idPlacesInventory}
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Estoque, Loja'/>
            </Item>
            <Item
                name={"situacao"}
                style={{ display: 'none'}}
            >
                <Input />
            </Item>
        </Form>

      </Modal>

      <Modal
        title={ "Eliminar Localização"}
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
                name="inventory"
                label="Data Inventário"
                rules={[{required: true, 
                         message: 'Informar Data de Inventário'}]}
                >
                <Select
                    disabled={!isEditing}
                    placeholder="Selecionar Data de Inventário"
                    allowClear  //Permite limpar seleção
                    loading={loading}   // Mostrar ícone de carregamento
                    options={selectInventory}
                >
                </Select>
            </Item>
            <Item
                name={"local"}
                label="Localização"
                rules={[{required: true, message: 'Informar Localização'}]}
                >
                <Input 
                    disabled={!isEditing}
                    style={{ textTransform: 'uppercase' }}
                    placeholder='Ex: Estoque, Loja'/>
            </Item>
            <Item
                name={"situacao"}
                style={{ display: 'none'}}
            >
                <Input />
            </Item>
        </Form>
        
      </Modal>

    </div>

  )
}

export default ListPlacesInventoryComponent