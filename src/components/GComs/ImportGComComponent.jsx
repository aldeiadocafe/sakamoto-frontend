import { useEffect, useState } from 'react';
import { Table, Input, Space, Upload, message, Spin, Button, Card, Progress, notification } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';

import * as XLSX from 'xlsx';
import Title from 'antd/es/typography/Title';
import { updateGComEstoque } from '../../services/StockBalanceService';

import { getAllStockBalances } from '../../services/StockBalanceService';


const ImportGComEstoqueComponent = () => {

  const [dadosStock, setDadosStock]   = useState([])
  const [dadosExcel, setDadosExcel]   = useState([])

  const [fileList, setFileList]       = useState('')
  const [progress, setProgress]       = useState(0)
  const [loading, setLoading]         = useState(false);
  const [botao,   setBotao]           = useState(false)

  const [exibirTabela,  setExibirTabela]  = useState(false)

  const [dados,       setDados]           = useState([])
  const [datesItem, setDatesItem]         = useState([])
  const [filterDesc,  setFilterDesc]      = useState([])
  const [tabela,      setTabela]          = useState(1);
  const [searchText,      setSearchText]  = useState('');

  
  const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 3,
  });

  const handleReset = (clearFilters, confirm) => {
      clearFilters();
      setSearchText({});
      confirm();
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
        title: 'Item', 
        dataIndex: 'itCodigo', 
        key: 'itCodigo',
        sorter: (a, b) => a.itcodigo.localeCompare(b.itcodigo),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('itCodigo'),
        onFilter: (value, record) => record.itcodigo.indexOf(value) === 0,      
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
        title: 'GCom Estoq', 
        dataIndex: 'gcomEstoque', 
        key: 'gcomEstoque',
        align: 'right',
        sorter: (a, b) => a.gcomEstoque - b.gcomEstoque,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
  ];

  // Propriedades de configuração do Upload
  const props = {    

    name: 'file', 
    multiple: false, // Permitir apenas um arquivo    
    fileList, // 1. Limitar os tipos de arquivo (.xls.xlsx)
    listType: 'picture',
    accept: '.xls.xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // 2. Validação antes de enviar

    showUploadList: {
      extra: ({ size = 0 }) => (
        <span style={{ color: '#cccccc' }}>({(size / 1024 / 1024).toFixed(2)}MB)</span>
      ),
      showDownloadIcon: true,
      downloadIcon: 'Download',
      showRemoveIcon: true,
    },

    beforeUpload: (file) => {
      const isExcel = 
        file.type === 'application/vnd.ms-excel' || 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isExcel) {
        message.error(`${file.name} não é um arquivo Excel válido.`);
        return Upload.LIST_IGNORE; // Remove arquivo inválido da lista
      }

      // Se passou na validação, impede o upload automático (retorna false)
      // e adiciona o arquivo à lista localmente
      setBotao(true)
      setExibirTabela(false)
      setFileList([file]);
      return false; 
    }, 
    
    onChange(info) {      
      const { status } = info.file;
      if (status !== 'uploading') {
//        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} carregado com sucesso.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} falha no upload.`);
      }
    }, 
    onRemove: () => {
      setBotao(false)
      setFileList([]); // Limpa o estado quando o arquivo é removido
    }
  };

  const atualizar = async () => {
    
    setLoading(true)

    setBotao(false)
    setExibirTabela(false)
    setProgress(0)

    const reader = new FileReader();

    // Simula progresso de leitura
    reader.onprogress = (evt) => {

      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 100)
        setProgress(percent)
      }
    }

    reader.onload = (evt) => {

      setProgress(50) // Lendo arquivo concluido

      // 1. Ler o arquivo
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      setTimeout( () => {
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // 2. Definir o intervalo (range)
        // Exemplo: Pular as primeiras 3 linhas e ler a partir da 4ª (índice 3)
        // A1-style range pode ser usado: range: "A4:D100"
        // Ou base 0: {s: {r: 3, c: 0}, e: {r: 1000, c: 3}} (Linha 4, Col A até Col D)
        
        const jsonData = XLSX.utils.sheet_to_json(ws, {
          range: 10, // Começa na 11ª linha (pula as primeiras 10)
          header: ["itCodigo", "descricao", "unidade", "quantidade"]// Opcional: Define nomes de colunas
        });

        setDadosExcel(jsonData)

        const item = jsonData.map(item => {   

          // Busca idStock
          const stock = dadosStock.find( stock => stock.itCodigo.toString().toUpperCase() ===
                                                    item.itCodigo.toString().toUpperCase())


          return {
            _id:  stock ? stock._id : null,
            gcomEstoque: item.quantidade,
          }
        })

        const items = item.filter(item => item._id !== null 
                      && item._id !== undefined 
                      && item._id !== "")

        if (items.length > 0 ) {

          updateGComEstoque(items).then(response => {

            message.success(`Atualizado ${items.length} linhas com sucesso.`);

            const dadosAux = items.map(item => {

              const stock = dadosStock.find( stock => stock._id === item._id)

              return {
                _id:          item._id,
                itCodigo:     stock.itCodigo,
                descricao:    stock.descricao,
                gcomEstoque:  item.gcomEstoque,
              }

            })

            setDados(dadosAux)
            setExibirTabela(true)

      //      openNotification()
          }).catch((error)=> {

              if (error.response) {
                  message.error(error.response.data || 'Erro no servidor');
              } else {
                  message.error('Erro ao atualizar!');
              }
                  
          });

        } else {
          message.error('Nenhuma linha atualizada! Verificar arquivo!');
        }
        

        setProgress(100)
        
        setFileList([]); // Limpa o estado quando o arquivo é removido
        setLoading(false)
      }, 2000)  // Atraso para visualizacao da barra

    }

    reader.readAsBinaryString(fileList[0]);

  }

  useEffect( () => {

    // Carregar Saldo Estoque
    getAllStockBalances().then( response => {

      // Ler
      const dados = response.data.map(item => ({
        _id:        item._id,
        itCodigo:   item.item.itCodigo,
        descricao:  item.item.descricao,
      }))
      setDadosStock(dados)

      //Montar filtro
      const filtro = dados.map((filtro) => ({
          text:   filtro.descricao,
          value:  filtro.descricao
      }))
      setFilterDesc(filtro)

    })
      
  }, [])

  return (

    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Atualizar Quantidade de Estoque GCom</Title>
        </div>
      
      <Spin
          spinning={loading}
          fullscreen
      />

        <Card
            size='small'
            style={{
                marginBottom: '10px',
                borderColor: '#c36434',
                boxShadow: '0 2px 8px #d4b8ab',
                borderRadius: 8,                    
            }}
        >

          <Upload {...props} fileList={fileList}>
            <Button icon={<UploadOutlined />}>Selecionar Excel</Button>
          </Upload>

          {loading && (
            <Card style={{ marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p>Processando: {progress}%</p>
                <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
              </div>
            </Card>            
          )}

{/*          {contextHolder} */}

          <Button
            type="primary"
            onClick={atualizar}
            disabled={!botao}
            style={{ marginTop: 16}}
          >
            Atualizar
          </Button>

        </Card>

        {exibirTabela && (

          <Card
              size='small'
              style={{
                  marginBottom: '10px',
                  borderColor: '#c36434',
                  boxShadow: '0 2px 8px #d4b8ab',
                  borderRadius: 8,                    
              }}
          >

            <div style={{ textAlign: 'left' }}>
                <Title level={4}
                    style={{ color: 'var(--primary-color)'}}
                >GCOM - Quantidades Atualizadas</Title>
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

          </Card>

        )}    

    </div>
  );

}

export default ImportGComEstoqueComponent