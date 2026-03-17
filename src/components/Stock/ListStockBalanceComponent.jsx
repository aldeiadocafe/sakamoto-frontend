import { useEffect, useState } from 'react';

import { Table, Badge, Spin, Input, Space, Button } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';


import { getAllStockBalances } from '../../services/StockBalanceService';
import { getAllDatesItem } from '../../services/DatesItemBalanceService';
import { getAllUnits } from '../../services/UnitService'

import * as XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const ListStockBalanceComponent = () => {

    const [dados,       setDados]                   = useState([])
    const [expandedDateItem, setExpandedDateItem ]  = useState([])

    const [dadosGCom, setDadosGCom]       = useState([])

    // 1. Estado para armazenar as chaves (keys) das linhas expandidas
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    const [datesItem, setDatesItem]     = useState([])
    const [filterDesc,  setFilterDesc]  = useState([])

    const [loading, setLoading] = useState(false);

    const [tabela,      setTabela]      = useState(1);

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 3,
    });

    const exportToExcel = () => {

        const dadosExcel = dados.map(item => ({
            Item:       item.itCodigo,
            Descrição:  item.descricao,
            Unid:       item.unidade,
            Quantidade: formatter.format(item.qtde),
            GCom:       formatter.format(item.gcomEstoque),
            "GCOM - Qtde":  formatter.format(item.diferenca),
        }))

        // Cria worksheet / Converte os dados (JSON) em worksheet
        const ws = XLSX.utils.json_to_sheet(dadosExcel)

/*
        // Fórmulas de multiplicação nas linhas 2 e 3
        ws['D2'] = { t: 'n', f: 'B2*C2' };
        ws['D3'] = { t: 'n', f: 'B3*C3' };
        
        // Fórmula de soma no final
        ws['D4'] = { t: 'n', f: 'SUM(D2:D3)', s: { font: { bold: true } } }; // Com estilo negrito
*/

        // Definir Estilos (Header)
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F81BD" } },
            alignment: { horizontal: "center" },
            border: {
                bottom: { style: "thin", color: { rgb: "000000" } }
            }
        }

        const rightAlignStyle = {
        alignment: {
            horizontal: 'right', // Opções: 'left', 'center', 'right'
        },
        };

        // Aplicar estilo aos cabeçalhos (A1, B1, C1)
        if (ws['A1']) ws['A1'].s = headerStyle;
        if (ws['B1']) ws['B1'].s = headerStyle;
        if (ws['C1']) ws['C1'].s = headerStyle;
        if (ws['D1']) ws['D1'].s = headerStyle;
        if (ws['E1']) ws['E1'].s = headerStyle;
        if (ws['F1']) ws['F1'].s = headerStyle;

        // 3. Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 10 }, // Largura da Coluna A
            { wch: 50 }, // Largura da Coluna B
            { wch: 5  }, // Largura da Coluna C
            { wch: 15 }, // Largura da Coluna D
            { wch: 15 }, // Largura da Coluna E
            { wch: 15 }, // Largura da Coluna F

        ]

        // Obtém o total de linhas (exclui o cabeçalho se json_to_sheet for usado sem customização)
        // O !ref contém o intervalo, ex: "A1:B3"
        const range = XLSX.utils.decode_range(ws['!ref']);
//        const totalLinhas = range.e.r - range.s.r; // range.e.r é a última linha (base 0)  >> range.e.r + 1); // +1 para contar a linha do cabeçalho

        // Exemplo para a coluna B2:B10
        for (let i = 2; i <= (range.e.r + 1); i++) {
//            const cellAddress = 'D' + i;
            if (!ws['D' + i]) continue; // Pular se a célula estiver vazia
            ws['D' + i].s = rightAlignStyle; // Aplica o estilo
            ws['E' + i].s = rightAlignStyle; // Aplica o estilo
            ws['F' + i].s = rightAlignStyle; // Aplica o estilo
        }

        // Cria um novo workbook
        const wb = XLSX.utils.book_new()

        // Adiciona a worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dados')

        // Gera o arquivo binário e força o download
//        XLSX.writeFile(wb, 'TabelaDados.xlsx')

        // 5. Gerar arquivo e baixar
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, 'saldo_item.xlsx');

    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // Note: The actual data filtering happens internally via the 'onFilter' prop, 
        // but you can manage a state here if needed for other components.
    };

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

  // Colunas principais
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
        title: 'Unid', 
        dataIndex: 'unidade', 
        key: 'unidade',
        sorter: (a, b) => a.unidade.localeCompare(b.unidade),
        showSorterTooltip: { target: 'sorter-icon' }, 
        ...getColumnSearchProps('unidade'),
        onFilter: (value, record) => record.unidade.indexOf(value) === 0,      
        ellipsis: true,
    },
    {
        title: 'Quantidade', 
        dataIndex: 'qtde', 
        key: 'qtde',
        align: 'right',
        sorter: (a, b) => a.qtde - b.qtde,
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
    {
        title: 'GCom - Estoq', 
        dataIndex: 'diferenca', 
        key: 'diferenca',
        align: 'right',
        sorter: (a, b) => a.diferenca - b.diferenca,
        showSorterTooltip: { target: 'sorter-icon' }, 
        render: (value) => formatter.format(value),
    },
    {
        dataIndex:  "dataInventario",
        title:      "Data Inventário",
        sorter: (a, b) => new Date(a.dataInventario).getTime() - new Date(b.dataInventario).getTime(),
        // Optional: set a default sort order
        showSorterTooltip: { target: 'sorter-icon' }, 
        ellipsis: true,
        render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
    },
  ];

    // Colunas da sub-tabela
    const expandedColunas = [
        {
            dataIndex:  "dataValidade",
            title:      "Dt Valid",
            sorter: (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime(),
            // Optional: set a default sort order
            showSorterTooltip: { target: 'sorter-icon' }, 
            render: (text) => dayjs.utc(text).format('DD/MM/YYYY'),
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
    ];

      
    const carregarDados = async () => {
 
        setLoading(true);

        setDados([])

        let unit
        //Unidade
        await getAllUnits().then((response) => {
            unit = response.data

        })

        await getAllDatesItem().then((response) => {

            const dadosAux = response.data.map(item => ({
                key:            item._id,
                idItem:         item.item._id,
                dataValidade:   item.dataValidade,
                quantidade:     item.quantidade,
            }))

            setExpandedDateItem(dadosAux);

        }).catch((error)=> {
            console.error(error);
        });

        setDadosGCom([])

        await getAllStockBalances().then(response => {

            const dadosAux = response.data.map(item => ({
                key:            item._id,
                idItem:         item.item._id,
                itCodigo:       item.item.itCodigo,
                descricao:      item.item.descricao,
                qtde:           item.quantidade,                
                unit:           item.item.unit,
                unidade:        (unit.find(unit => unit._id === item.item.unit).unidade),
                gcomEstoque:    item.gcomEstoque,
                diferenca:      item.gcomEstoque - item.quantidade,
                dataInventario: item.dataInventario
            }))

            setDados(dadosAux);

            //Montar filtro
            const filtro = dadosAux.map((filtro) => ({
                text:   filtro.descricao,
                value:  filtro.descricao
            }))
            setFilterDesc(filtro)


        }).catch((error)=> {
            console.error(error);
        });

        setLoading(false);

    }

    const expandedRowRender = (record) => {

        //Filtrar dados da filha
        const filterItem = expandedDateItem.filter((item) => item.idItem === record.idItem)

        return (
            <Table 
                columns={expandedColunas} 
                dataSource={filterItem} 
                title={() => (
                    <Title level={4}
                        style={{ 
                            color: 'var(--primary-color)',
                            padding: '0px',
                            margin: '0px',
                        }}
                    >
                        Data de Validade
                    </Title>
                )} // <--- Título aqui
                size={'small'}
                showSorterTooltip={true}
                tableLayout='auto'
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

        )

    }

    // 2. Função para expandir todas as linhas
    const expandAll = () => {
        const allKeys = dados.map((record) => record.key);
        setExpandedRowKeys(allKeys);
    };

    // 3. Função para recolher todas as linhas
    const collapseAll = () => {
        setExpandedRowKeys([]);
    };

    useEffect(() => {
        carregarDados()
    }, [])


  return (

    <div>

        <div style={{ textAlign: 'center' }}>
            <Title level={2}
                style={{ color: 'var(--primary-color)'}}
            >Consultar Saldo do Item</Title>
        </div>

        <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
        }}
        >
            <Space style={{ marginBottom: 16 }}>
                <Button onClick={expandAll}>Expandir Tudo</Button>
                <Button onClick={collapseAll}>Recolher Tudo</Button>
                <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={exportToExcel}
                >
                    Exportar para Excel
                </Button>                
            </Space>
        </div>

        <Spin
            spinning={loading}
            fullscreen
        />

        <Table
            columns={colunas}
            dataSource={dados}
            size={'small'}
            showSorterTooltip={true}
            tableLayout='auto'
//            onChange={onChange}
            scroll={{ y: 'calc(80vh - 50px)' }}
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
/*            
            expandable={{            
                expandedRowRender: (record) => (
                    <Table 
                        columns={expandedColunas} 
                        dataSource={expandedDateItem} 
                        title={() => 'Data de Validade'} // <--- Título aqui
                        size={'small'}
                        showSorterTooltip={true}
                        tableLayout='auto'
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
                ),
            }}
*/
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

    </div>

  );
};

export default ListStockBalanceComponent;
