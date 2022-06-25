import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import validator from 'validator';

import TextInput from '../elements/TextInput';
import Button from '../elements/Button';
import i18n from '../lang/i18n';
import UserService from '../services/UserService';
import Helper from '../common/Helper';
import Link from '../elements/Link';

export default function ForgotPasswordScreen({ navigation, route }) {
    const isFocused = useIsFocused();
    const [email, setEmail] = useState('');
    const [emailRequired, setEmailRequired] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [emailValid, setEmailValid] = useState(true);
    const [sent, setSent] = useState(false);
    const ref = useRef(null);

    const _init = async () => {
        const language = await UserService.getLanguage();
        i18n.locale = language;
        setEmail('');
        setEmailRequired(false);
        setEmailValid(true);
        setEmailError(false);
        setSent(false);
        if (ref.current) ref.current.clear();
    };

    useEffect(() => {
        if (isFocused) {
            _init();
        }
    }, [route.params, isFocused]);

    const validateEmail = async () => {
        if (email) {
            setEmailRequired(false);

            if (validator.isEmail(email)) {
                try {
                    const status = await UserService.validateEmail({ email });
                    if (status === 200) {
                        setEmailError(true);
                        setEmailValid(true);
                        return false;
                    } else {
                        setEmailError(false);
                        setEmailValid(true);
                        return true;

                    }
                } catch (err) {
                    Helper.toast(i18n.t('GENERIC_ERROR'));
                    setEmailError(false);
                    setEmailValid(true);
                    return false;
                }
            } else {
                setEmailError(false);
                setEmailValid(false);
                return false;
            }
        } else {
            setEmailError(false);
            setEmailValid(true);
            setEmailRequired(true);
            return false;
        }
    };

    const onChangeEmail = (text) => {
        setEmail(text);
        setEmailRequired(false);
        setEmailValid(true);
        setEmailError(false);
    }

    const onPressReset = async () => {
        const emailValid = await validateEmail();
        if (!emailValid) {
            return;
        }

        UserService.resend(email, true)
            .then(status => {
                if (status === 200) {
                    setEmailRequired(false);
                    setEmailValid(true);
                    setEmailError(false);
                    setSent(true);
                } else {
                    Helper.error();
                }
            })
            .catch((err) => {
                Helper.error(err);
            });
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
        >
            {sent &&
                <View style={styles.contentContainer}>
                    <Text style={styles.text}>{i18n.t('RESET_EMAIL_SENT')}</Text>
                    <Link label={i18n.t('GO_TO_HOME')} onPress={() => navigation.navigate('Home')} />
                </View>
            }
            {!sent &&
                <View style={styles.contentContainer}>
                    <Text style={styles.text}>{i18n.t('RESET_PASSWORD')}</Text>

                    <TextInput
                        ref={ref}
                        style={styles.component}
                        label={i18n.t('EMAIL')}
                        error={emailRequired || !emailValid || emailError}
                        helperText={
                            ((emailRequired && i18n.t('REQUIRED')) || '')
                            || ((!emailValid && i18n.t('EMAIL_NOT_VALID')) || '')
                            || ((emailError && i18n.t('RESET_EMAIL_ERROR')) || '')
                        }
                        onSubmitEditing={onPressReset}
                        onChangeText={onChangeEmail} />

                    <Button style={styles.component} label={i18n.t('RESET')} onPress={onPressReset} />
                </View>
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    text: {
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: 15,
        fontWeight: '400',
        alignSelf: 'stretch',
        margin: 10,
        padding: 5
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        backgroundColor: '#fafafa'
    },
    contentContainer: {
        width: '100%',
        maxWidth: 480,
        alignItems: 'center'
    },
    component: {
        alignSelf: 'stretch',
        margin: 10,
    },
});