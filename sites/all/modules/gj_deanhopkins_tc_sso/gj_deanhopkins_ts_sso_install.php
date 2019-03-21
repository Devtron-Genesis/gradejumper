<?php


/************************************************************
 * gj_deanhopkins_ts_sso_install                            *
 ************************************************************
 * Description: Implements hook_install(). Create module    *
 *              roles and fields upon module installation   *
 * Arguments:                                               *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_deanhopkins_ts_sso_install() {
    gj_install_create_new_roles();
    gj_install_create_new_fields();
}

/************************************************************
 * gj_install_create_new_roles                            *
 ************************************************************
 * Description: Create roles required by the module. Called *
 *              upon installation.                          *
 * Arguments:                                               *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_install_create_new_roles(){
    $new_role_names = array('Student', 'Tutor', 'Parent', 'Manager');
    $roles = user_roles(TRUE);
    foreach ($new_role_names as $new_role_name){
        if (!in_array($new_role_name, $roles)) {
            $new_role = new stdClass();
            $new_role->name = $new_role_name;
            try {
                user_role_save($new_role);
            } catch (Exception $e) {
                echo "Role already exists.";
            }
        }
    }
}

/************************************************************
 * gj_install_create_new_fields                             *
 ************************************************************
 * Description: Create tcid user profile field required by  *
 *              the module. Called upon installation.       *
 * Arguments:                                               *
 * Return:      void                                        *
 ************************************************************
 * Author:      Dean Hopkins                                *
 * Date:        20-11-2018                                  *
 ************************************************************/
function gj_install_create_new_fields(){
    $new_field_name = "tcid";
    if(!field_info_field($new_field_name)) // check if the field already exists.
    {
        $field = array(
            'field_name'    => $new_field_name,
            'type'          => 'text',
        );
        try {
            field_create_field($field);
        } catch (Exception $e) {
            echo "Field already exists.";
        }

        $field_instance = array(
            'field_name'    => $new_field_name,
            'entity_type'   => 'user',
            'bundle'        => 'user',
            'label'         => t('TutorCruncher ID'),
            'description'   => t(''),
            'widget'        => array(
                'type'      => 'text_textfield',
                'weight'    => 10,
            ),
            'formatter'     => array(
                'label'     => t('field formatter label'),
                'format'    => 'text_default'
            ),
            'settings'      => array(
            )
        );

        try {
            field_create_instance($field_instance);
        } catch (Exception $e) {
            throw new Exception("Error creating new field instance: tcid");
        }
    }
}