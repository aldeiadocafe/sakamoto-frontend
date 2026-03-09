import { useEffect, useState } from 'react'
import { Column } from '@ant-design/plots'
import { Button, Card, Col, Input, Layout, Row, Space, Table } from 'antd'
import { Content } from 'antd/es/layout/layout'

import { getAllDatesItem } from '../services/DatesItemBalanceService'
import { getAllUnits } from '../services/UnitService'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { SearchOutlined } from '@ant-design/icons'
import { getAllStockBalances } from '../services/StockBalanceService'

dayjs.extend(utc)

const IndexComponent = () => {

  const [ datesItem,    setDatesItem]   = useState([])
  const [ loading,      setLoading]     = useState(false)

  const [tabela,        setTabela]      = useState(1);

  const [dadosGCom, setDadosGCom]       = useState([])
  const [filterDesc,  setFilterDesc]    = useState([])
  const [searchText,      setSearchText]      = useState('');


  // 1. Nome do array precisa ser data
  const [data, setData] = useState([])

  const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 3,
  });

  const handleReset = (clearFilters, confirm) => {
      clearFilters();
      setSearchText({});
      confirm();
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      // Note: The actual data filtering happens internally via the 'onFilter' prop, 
      // but you can manage a state here if needed for other components.
  };

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

  const colunas = [
      {
          dataIndex:  'itCodigo',
          key:  'itCodigo',
          title: 'Item',
          sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('itCodigo'),
          onFilter: (value, record) => record.itCodigo.indexOf(value) === 0,      
          ellipsis: true,
      },
      {
          dataIndex:  'descricao',
          key:  'descricao',
          title: 'Descrição',
          sorter: (a, b) => a.descricao.localeCompare(b.descricao),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('descricao'),
          onFilter: (value, record) => record.descricao.indexOf(value) === 0,      
          ellipsis: true,
      },
      {
          dataIndex:  "unidade",
          key:        'unidade',
          title:      "Unid",
          sorter: (a, b) => a.unidade.localeCompare(b.unidade),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('unidade'),
          onFilter: (value, record) => record.unidade.indexOf(value) === 0,      
          ellipsis: true,
      },
      {
          dataIndex:  "dataValidade",
          key:        'dataValidade',
          title:      "Dt Valid",
          defaultSortOrder: 'ascend', 
          sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('dataValidade'),
          onFilter: (value, record) => record.dataValidade.indexOf(value) === 0,      
          render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
      },
      {
          dataIndex:  "quantidade",
          key:        'quantidade',
          title:      "Quantidade",
          align: 'right',
          sorter: (a, b) => a.quantidade - b.quantidade,
          showSorterTooltip: { target: 'sorter-icon' }, 
          render: (value) => formatter.format(value)
      },
  ]

  // Colunas principais
  const colunasGCom = [
    {
        title: 'Item', 
        dataIndex: 'itCodigo', 
        key: 'itCodigo',
        sorter: (a, b) => a.itCodigo.localeCompare(b.itCodigo),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('itCodigo'),
        onFilter: (value, record) => record.itCodigo.indexOf(value) === 0,      
        ellipsis: true,
    },
    {
        title: 'Descrição', 
        dataIndex: 'descricao', 
        key: 'descricao',
        filters:filterDesc,
        filterMode: 'tree',
        filterSearch: true,
        sorter: (a, b) => a.descricao.localeCompare(b.descricao),
        defaultSortOrder: 'ascend', 
        onFilter: (value, record) => record.descricao.indexOf(value) === 0,      
        ellipsis: true,
    },
    {
        title:      "Unid",
        dataIndex:  "unidade",
        key:  "unidade",
        sorter: (a, b) => a.unidade.localeCompare(b.unidade),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('unidade'),
        onFilter: (value, record) => record.unidade.indexOf(value) === 0,      
        ellipsis: true,
    },
    {
        title: 'Qtde', 
        dataIndex: 'quantidade', 
        key: 'quantidade',
        align: 'right',
        sorter: (a, b) => a.quantidade - b.quantidade,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        title: 'GCom Estoq', 
        dataIndex: 'gcomEstoque', 
        key: 'gcomEstoque',
        align: 'right',
        sorter: (a, b) => a.gcomEstoque - b.gcomEstoque,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
  ];

  const carregarDados = async () => {

    setLoading(true);

    try {

      let unit
      await getAllUnits().then((response) => {
        unit = response.data
      }).catch((error)=> {
          console.error(error);
      });

      setDadosGCom([])

      await getAllStockBalances().then(response => {

        const dados = response.data.map(item => ({
          _id:          item._id,
          itCodigo:     item.item.itCodigo,
          descricao:    item.item.descricao,
          unidade:      (unit.find(unit => unit._id === item.item.unit).unidade),
          quantidade:   item.quantidade,
          gcomEstoque:  item.gcomEstoque
        }))

        setDadosGCom(dados)

        //Montar filtro
        const filtro = dados.map((filtro) => ({
            text:   filtro.descricao,
            value:  filtro.descricao
        }))
        setFilterDesc(filtro)

      })

      await getAllDatesItem().then((response) => {

        const dados = response.data.map(item => ({
          idItem:       item.item._id,
          itCodigo:     item.item.itCodigo,
          descricao:    item.item.descricao,
          unit:         item.item.unit,
          unidade:      (unit.find(unit => unit._id === item.item.unit).unidade),
          dataValidade: item.dataValidade,
          quantidade:   item.quantidade
        }))

        setDatesItem(dados)

        if (dados.length > 0) {

          const hoje = dayjs(new Date().toISOString().split('T')[0])

          const dataAux = [
            { dias: '5 dias',  total: 0 },
            { dias: '10 dias', total: 0 },
            { dias: '15 dias', total: 0 },
            { dias: '20 dias', total: 0 },
            { dias: '25 dias', total: 0 },
            { dias: '30 dias', total: 0 },
          ];
          
          // 5 dias
          dataAux[0].total = dados
                        .filter(item => (
                          dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day')) <= 4 
                        )
                        .reduce((sum, item) => sum + item.quantidade, 0)

          // 10 dias
          dataAux[1].total = dados
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 4)
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 9)
                        .reduce((sum, item) => sum + item.quantidade, 0)

          // 15 dias
          dataAux[2].total = dados
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 9)
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 14)
                        .reduce((sum, item) => sum + item.quantidade, 0)

          // 20 dias
          dataAux[3].total = dados
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 14)
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 19)
                        .reduce((sum, item) => sum + item.quantidade, 0)

          // 25 dias
          dataAux[4].total = dados
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 19)
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 24)
                        .reduce((sum, item) => sum + item.quantidade, 0)

          // 30 dias
          dataAux[5].total = dados
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') > 24)
                        .filter(item => dayjs(new Date(item.dataValidade).toISOString().split('T')[0]).diff(hoje, 'day') <= 29)
                        .reduce((sum, item) => sum + item.quantidade, 0)

/*
          dataAux[0].total = 10
          dataAux[1].total = 30
          dataAux[2].total = 25
          dataAux[3].total = 60
          dataAux[4].total = 33
*/

          setData(dataAux)

        }

      }).catch((error)=> {
          console.error(error);
      });

    } catch (error) {
        console.error(error);
    }

  }

  // 2. Chart configuration
  const config = {
    data,
    xField: 'dias', // Field for the x-axis
    yField: 'total', // Field for the y-axis
    label: {
      // Configuração de labels nas barras
      style: {
        fill: '#f7f5f5',
      },
    },
    height: 180, // Optional: set a fixed height
    // Opcional: animação ao carregar
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },  
  };

  useEffect(() => {

    carregarDados()

  }, [])

  return (
    <Layout >      
      <Content style={{ margin: '10px'}}>
        <Row gutter={16}>

          <Col span={8}>
            <Card
              title="Total de Produtos à Vencer"
            >
              <Column {...config} />
            </Card>
          </Col>

          <Col span={16}>
            <Card
              title="Aldeia X GCom"
            >

              <Table
                  columns={colunasGCom}
                  dataSource={dadosGCom}      
                  showSorterTooltip={true}
                  size={'small'}
                  scroll={{ y: 'calc(50vh - 235px)' }}                
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
          </Col>

        </Row>

        <Card 
          title="Produtos por Data de Validade" 
          style={{ marginTop: '16px' }}>
          <Table
              columns={colunas} 
              dataSource={datesItem} 
              showSorterTooltip={true}
              size={'small'}
              tableLayout="auto"
              scroll={{ y: 'calc(17vh)' }}                
//              scroll={{ y: 110 }}                
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
      </Content>
    </Layout>
  )
}

export default IndexComponent