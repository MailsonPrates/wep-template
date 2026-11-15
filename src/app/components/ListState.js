import Empty from "./Empty";

/**
 * Lista com os três estados: carregando, vazia e com itens.
 *
 *   <ListState loading={loading} items={data} empty="Nenhum grupo">
 *       {(item) => <GroupItem key={item.user_group_id} item={item} />}
 *   </ListState>
 */
export default function ListState({ loading = false, items = [], empty, className = "", children }) {
    const list = Array.isArray(items) ? items : [];

    return (
        <div className={`${className}${loading ? " full-loading" : ""}`} style={loading && !list.length ? { minHeight: 120 } : undefined}>
            {list.length
                ? list.map((item, index) => children(item, index))
                : (!loading && <Empty message={empty} />)}
        </div>
    );
}
