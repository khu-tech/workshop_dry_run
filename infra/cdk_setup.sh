#!/bin/bash

setQualifier() {
  _RNDLength=8
  _Alphanumeric="abcdefghijklmnopqrstuvwxyz0123456789"
  _Str="${_Alphanumeric}987654321"

  _Len=${#_Str}
  _count=0
  _QUALIFIER=""

  while [ $_count -lt $_RNDLength ]; do
    _count=$(( _count + 1 ))
    _RND=$RANDOM
    _RND=$(( _RND % _Len ))
    _QUALIFIER="${_QUALIFIER}${_Alphanumeric:$_RND:1}"
  done

  value1=$_QUALIFIER
  CDK_DEFAULT_QUALIFIER=$_QUALIFIER
  echo "$_QUALIFIER $CDK_DEFAULT_QUALIFIER"
}

# Call setQualifier function and set value1
setQualifier
echo "Value1=$value1"

# Execute AWS command to get CDK_DEFAULT_ACCOUNT
CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)
echo $CDK_DEFAULT_ACCOUNT

# Execute AWS command to get CDK_DEFAULT_REGION
CDK_DEFAULT_REGION=$(aws configure get region)
echo $CDK_DEFAULT_REGION

exit $?