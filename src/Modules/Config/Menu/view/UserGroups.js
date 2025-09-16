import Form from 'react-bootstrap/Form';

function UserGroups({userGroupList, onChange, selected}) {

    selected = selected.split(",");

  return (
    <div className='mt-3'>
        <label className='fw-semibold'>Usuários permitidos</label>
        <Form onChange={onChange} className='mt-2'>
            {userGroupList.map(item => {
                return (
                    <Form.Check
                        key={item.user_group_id}
                        type="switch"
                        name="userGroups"
                        className='pointer mb-2'
                        value={item.user_group_id}
                        label={item.name}
                        defaultChecked={selected.includes(item.user_group_id.toString())}
                    />
                )
            })}
        </Form>
    </div>
  );
}

export default UserGroups;