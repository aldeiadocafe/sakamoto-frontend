import { useState } from 'react';
import { Input, Progress, message, Card, Spin, Table, Upload, Button, Space } from 'antd';
import { XMLParser } from 'fast-xml-parser';

import { UploadOutlined, SearchOutlined } from '@ant-design/icons';

import Title from 'antd/es/typography/Title';
import { createNfe, getChaveNfe } from '../../services/NfeService';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { createAllItemsNfe, createItemsNfe } from '../../services/ItemsNfeService';
import { ALDEIA_CNPJ } from '../../config/constant';

dayjs.extend(utc)

const ImportInvoicesComponent = () => {

  const [dados,       setDados]                   = useState([])
  const [expandedItemsNfe, setExpandedItemsNfe ]  = useState([])
  const [tabela,      setTabela]      = useState(1);

  // 1. Estado para armazenar as chaves (keys) das linhas expandidas
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const [fileList, setFileList]   = useState('')
  const [progress, setProgress]   = useState(0)

  const [botao,   setBotao]           = useState(false)
  const [loading, setLoading]         = useState(false);
  const [filterDesc,  setFilterDesc]  = useState([])
  const [searchText,  setSearchText]  = useState('');

  const [exibirTabela,  setExibirTabela]  = useState(false)

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

  // Colunas principais
  const colunas = [
    {
        title: 'Número', 
        dataIndex: 'numero', 
        key: 'numero',
        render: (text) => text
    },
    {
        title: 'Série', 
        dataIndex: 'serie', 
        key: 'serie',
        render: (text) => text
    },
    {
        dataIndex:  "dataEmissao",
        title:      "Data Emissão",
        render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
    },    
    {
        title: 'CNPJ', 
        dataIndex: 'emitCnpj', 
        key: 'emitCnpj',
        render: (text) => text
    },
    {
        title: 'Nome', 
        dataIndex: 'emitNome', 
        key: 'emitNome',
        ellipsis: true,
        render: (text) => text
    },
    {
        title: 'Inf Compl', 
        dataIndex: 'infCpl', 
        key: 'infCpl',
        ellipsis: true,
        render: (text) => text
    },
    {
        title: 'Valor Total', 
        dataIndex: 'valorTotal', 
        key: 'valorTotal',
        align: 'right',
        render: (value) => formatter.format(value),
    },
    {
        title: 'CNPJ Transp', 
        dataIndex: 'transpCnpj', 
        key: 'transpCnpj',
        render: (text) => text
    },
    {
        title: 'Nome Transp', 
        dataIndex: 'transpNome', 
        key: 'transpNome',
        ellipsis: true,
        render: (text) => text
    },
    {
        title: 'Esp Volume', 
        dataIndex: 'transpVolEsp', 
        key: 'transpVolEsp',
        render: (text) => text
    },
    {
        title: 'Nro Volume', 
        dataIndex: 'transpVolnro', 
        key: 'transpVolnro',
        render: (text) => text
    },
    {
        title: 'Peso Bruto Transp', 
        dataIndex: 'transpPesoBruto', 
        key: 'transpPesoBruto',
        align: 'right',
        render: (value) => formatter.format(value),
    },
    {
        title: 'Peso Liq Transp', 
        dataIndex: 'transpPesoLiq', 
        key: 'transpPesoLiq',
        align: 'right',
        render: (value) => formatter.format(value),
    },
    {
        title: 'Qtde Volume', 
        dataIndex: 'transpVolQtde', 
        key: 'transpVolQtde',
        align: 'right',
        render: (value) => formatter.format(value),
    },
  ];

  // Colunas da sub-tabela
  const expandedColunas = [    
      {
          title: 'Seq', 
          dataIndex: 'nItem', 
          key: 'nItem',
          align: 'right',
          width: 60,
          defaultSortOrder: 'ascend', 
          sorter: (a, b) => a.nItem - b.nItem,
          showSorterTooltip: { target: 'sorter-icon' }, 
      },
      {
          title: 'Código', 
          dataIndex: 'codigo', 
          key: 'codigo',
          sorter: (a, b) => a.codigo.toString().localeCompare(b.codigo.toString()),
          showSorterTooltip: { target: 'sorter-icon' }, 
          ...getColumnSearchProps('codigo'),
          onFilter: (value, record) => record.codigo.toString().indexOf(value) === 0,      
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
          onFilter: (value, record) => record.descricao.indexOf(value) === 0,      
          ellipsis: true,
      },
      {
          title: 'Quantidade', 
          dataIndex: 'quantidade', 
          key: 'quantidade',
          align: 'right',
          sorter: (a, b) => a.quantidade - b.quantidade,
          showSorterTooltip: { target: 'sorter-icon' }, 
          render: (value) => formatter.format(value),
      },
      {
          title: 'Valor Unitário', 
          dataIndex: 'valorUnitario', 
          key: 'valorUnitario',
          align: 'right',
          sorter: (a, b) => a.valorUnitario - b.valorUnitario,
          showSorterTooltip: { target: 'sorter-icon' }, 
          render: (value) => formatter.format(value),
      },
      {
          title: 'Valor Total', 
          dataIndex: 'valorTotal', 
          key: 'valorTotal',
          align: 'right',
          sorter: (a, b) => a.valorTotal - b.valorTotal,
          showSorterTooltip: { target: 'sorter-icon' }, 
          render: (value) => formatter.format(value),
      },
      
  ];

  const handleReset = (clearFilters, confirm) => {
      clearFilters();
      setSearchText({});
      confirm();
  };

  const importar = async () => {

    setLoading(true)

    setBotao(false)
    setExibirTabela(false)
    setProgress(0)

    const reader = new FileReader();

    reader.onload = async (e) => {

      setDados([])
      setExpandedItemsNfe([])

      const xmlString = e.target.result;      
      try {

        // Configuração do parser
        const parser = new XMLParser({
          ignoreAttributes: false, // Necessário para pegar atributos como chave de acesso    
          parseTagValue: false,    // Mantém todos os valores como string
          attributeNamePrefix: "@_"
        });

        const jsonObj = parser.parse(xmlString);

        // O XML da NFe geralmente segue a estrutura: nfeProc -> NFe -> infNFe
        const nfe = jsonObj.nfeProc?.NFe?.infNFe;
        
        if (!nfe) {
          throw new Error('Estrutura XML de NFe inválida.');
        }

        let notaDados = [{
          chave: jsonObj.nfeProc.protNFe.infProt.chNFe,
          numero: nfe.ide.nNF,
          serie: nfe.ide.serie,
          dataEmissao: nfe.ide.dhEmi,
          aldeiaCnpj: ALDEIA_CNPJ,
          emitCnpj: nfe.emit.CNPJ,
          emitNome: nfe.emit.xNome,
          infCpl: nfe.infAdic.infCpl,
          valorTotal: nfe.total.ICMSTot.vNF,
          transpCnpj: nfe.transp.transporta.CNPJ,
          transpNome: nfe.transp.transporta.xNome,
          transpVolEsp: nfe.transp.vol.esp,
          transpVolnro: nfe.transp.vol.nVol,
          transpPesoBruto: nfe.transp.vol.pesoB,
          transpPesoLiq: nfe.transp.vol.pesoL,
          transpVolQtde: nfe.transp.vol.qVol,
        }]

        // Normalizar para array (se for 1 item, fast-xml-parser retorna objeto, se >1, array)
        const detArray = Array.isArray(nfe.det) ? nfe.det : [nfe.det];
        const itemsNota = detArray.map((det) => ({
          nItem: det["@_nItem"], // Aqui está o det nItem="X"
          codigo: det.prod?.cProd,
          descricao: det.prod?.xProd,
          quantidade: det.prod?.qCom,
          valorUnitario: det.prod?.vUnCom,
          valorTotal: det.prod?.vProd,
        }));
/*        
        //Verificar se a nota já foi importada
        const notaVerif = await getChaveNfe(notaDados.chave)
        if (notaVerif.lenght > 0) {
          throw new Error('Nota Fiscal já importada!');
        }      
*/
        await gravarNota(notaDados, itemsNota)

        setFileList([])
        setLoading(false)

//        message.success('XML lido com sucesso!');

      } catch (error) {
        console.error(error);
        message.error('Erro ao processar o arquivo XML.');
        setLoading(false)
      }
    };

    reader.readAsText(fileList[0]);
    // Retorna false para evitar o upload automático (o antd faz o upload por padrão)
    return false;
  };

  const gravarNota = async (nota, itemsNota) => {

    try {

        //Criar as tabelas de Nota Fiscal
        await createNfe(nota[0]).then(response => {

          const itemsNfe = itemsNota.map(item => ({
            nfe:            response.data,
            nItem:          item.nItem,
            codigo:         item.codigo, 
            descricao:      item.descricao,
            quantidade:     item.quantidade,
            valorUnitario:  item.valorUnitario,
            valorTotal:     item.valorTotal
          }))

          createAllItemsNfe(itemsNfe).then(response => {

            setDados(nota)
            setExpandedItemsNfe(itemsNota)

            const allKeys = nota.map((record) => record.key);
            setExpandedRowKeys(allKeys);

            setExibirTabela(true)

            message.success('Registro criado com sucesso!')

          }).catch((error)=> {

              if (error.response) {
                  message.error(error.response.data || 'Erro no servidor');
              } else {
                  message.error('Erro ao criar!');
              }

          });

        }).catch((error)=> {

            if (error.response) {
                message.error(error.response.data || 'Erro no servidor');
            } else {
                message.error('Erro ao criar!');
            }
            
        });
        
    } catch (error) {

      if (error.response) {
          message.error(error.response.data || 'Erro no servidor');
      } else {
          message.error('Erro ao criar!');
      }

    }

  }

  // Propriedades de configuração do Upload
  const props = {    
    name: 'file', 
    multiple: false, // Permitir apenas um arquivo    
    fileList, // 1. Limitar os tipos de arquivo (.xls.xlsx)
    listType: 'picture',
    accept: '.xml', // 2. Validação antes de enviar

    showUploadList: {
      extra: ({ size = 0 }) => (
        <span style={{ color: '#cccccc' }}>({(size / 1024 / 1024).toFixed(2)}MB)</span>
      ),
      showDownloadIcon: true,
      downloadIcon: 'Download',
      showRemoveIcon: true,
    },

    beforeUpload: (file) => {
      
      const isXML = file.type === 'text/xml'
      
      if (!isXML) {
        message.error(`${file.name} não é um arquivo XML válido.`);
        return Upload.LIST_IGNORE; // Remove arquivo inválido da lista
      }

      // Se passou na validação, impede o upload automático (retorna false)
      // e adiciona o arquivo à lista localmente
      setBotao(true)
      setExibirTabela(false)
      setDados([])
      setExpandedItemsNfe([])
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

  const expandedRowRender = (record) => {

      //Filtrar dados da filha
      const filterItem = expandedItemsNfe.filter((item) => item.idItem === record.idItem)

      return (
          <Table 
              columns={expandedColunas} 
              dataSource={filterItem} 
              scroll={{ y: 'calc(50vh - 215px)' }}
              title={() => (
                  <Title level={4}
                      style={{ 
                          color: 'var(--primary-color)',
                          padding: '0px',
                          margin: '0px',
                      }}
                  >
                      Items da Nota Fiscal
                  </Title>
              )} // <--- Título aqui
              size={'small'}
              showSorterTooltip={true}
              tableLayout='auto'
              pagination={{
                  tabela,
                  // The available options for items per page
                  pageSizeOptions: ['5', '10', '20', '30', '100'], 
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

      )

  }

  return (
    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Importar Nota Fiscal Eletrônica (NFe)</Title>
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
            <Button icon={<UploadOutlined />}>Selecionar Arquivo XML</Button>
          </Upload>

          {loading && (
            <Card style={{ marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p>Processando: {progress}%</p>
                <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
              </div>
            </Card>            
          )}

          <Button
            type="primary"
            onClick={importar}
            disabled={!botao}
            style={{ marginTop: 16}}
          >
            Importar
          </Button>

        </Card>

        {exibirTabela && (

          <Card
              size='small'
              style={{
                  height: 460,
                  marginBottom: '10px',
                  borderColor: '#c36434',
                  boxShadow: '0 2px 8px #d4b8ab',
                  borderRadius: 8,                    
              }}
          >

            <div style={{ textAlign: 'left' }}>
                <Title level={4}
                    style={{ color: 'var(--primary-color)'}}
                >Nota Fiscal Importada</Title>
            </div>

            <Table
                columns={colunas}
                dataSource={dados}
                size={'small'}
                showSorterTooltip={true}
                tableLayout='auto'
//                scroll={{ y: 'calc(80vh - 50px)' }}
                scroll={{ x: 'max-content' }}

                expandable={{ 
                    expandedRowRender,
                    // 4. Conectar o estado controlado
                    expandedRowKeys: expandedRowKeys,
                    // 5. Atualizar o estado quando o usuário clicar manualmente
                    onExpand: (expanded, record) => {
                        const keys = expanded
                        ? [...expandedRowKeys, record.key] // Adiciona se expandir
                        : expandedRowKeys.filter((key) => key !== record.key); // Remove se fechar
                        setExpandedRowKeys(keys);
                    },                
                }}

            />

          </Card>

        )}    

    </div>
  );

}

export default ImportInvoicesComponent